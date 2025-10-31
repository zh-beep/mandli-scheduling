/**
 * Integration tests for end-to-end workflows
 *
 * Tests cover:
 * 1. User fills availability via unique link → runs algorithm → appears in admin schedule
 * 2. Remove user from day → verify can reassign
 */

const { supabaseAdmin } = require('../../config/supabase');
const { generateMonthlySchedule, applySchedule } = require('../../services/matching');

// Test data cleanup helper
async function cleanupTestData(testUserIds = [], testMonth = null) {
  try {
    // Clean up schedules
    if (testMonth) {
      await supabaseAdmin
        .from('schedules')
        .delete()
        .eq('month', testMonth);
    }

    // Clean up availability
    if (testUserIds.length > 0) {
      await supabaseAdmin
        .from('availability')
        .delete()
        .in('user_id', testUserIds);
    }

    // Clean up test users
    if (testUserIds.length > 0) {
      await supabaseAdmin
        .from('users')
        .delete()
        .in('id', testUserIds);
    }
  } catch (error) {
    console.error('Cleanup error:', error);
  }
}

describe('End-to-End Workflow Integration Tests', () => {
  let testUserIds = [];
  const testMonth = '2025-11';

  // Setup: Create test users before each test
  beforeEach(async () => {
    // Create test users with unique links
    const testUsers = [
      {
        full_name: 'Test User Gents 1',
        email: 'test-gents1@test.com',
        cell_phone: '+1234567890',
        gender: 'gents',
        unique_link: 'test-gents-1-unique-link'
      },
      {
        full_name: 'Test User Gents 2',
        email: 'test-gents2@test.com',
        cell_phone: '+1234567891',
        gender: 'gents',
        unique_link: 'test-gents-2-unique-link'
      },
      {
        full_name: 'Test User Ladies 1',
        email: 'test-ladies1@test.com',
        cell_phone: '+1234567892',
        gender: 'ladies',
        unique_link: 'test-ladies-1-unique-link'
      },
      {
        full_name: 'Test User Ladies 2',
        email: 'test-ladies2@test.com',
        cell_phone: '+1234567893',
        gender: 'ladies',
        unique_link: 'test-ladies-2-unique-link'
      }
    ];

    const { data: createdUsers, error } = await supabaseAdmin
      .from('users')
      .insert(testUsers)
      .select();

    expect(error).toBeNull();
    expect(createdUsers).toHaveLength(4);

    testUserIds = createdUsers.map(u => u.id);
  });

  // Cleanup: Remove test data after each test
  afterEach(async () => {
    await cleanupTestData(testUserIds, testMonth);
    testUserIds = [];
  });

  /**
   * Test 1: User fills availability → runs algorithm → appears in admin schedule
   *
   * Scenario:
   * 1. User accesses unique link
   * 2. User submits availability for certain days
   * 3. Admin runs scheduling algorithm
   * 4. Admin can see user assigned to duties on admin portal
   */
  test('User fills availability via unique link, algorithm runs, user appears in admin schedule', async () => {
    // Step 1: Get user with unique link (simulating user accessing their link)
    const { data: user, error: userError } = await supabaseAdmin
      .from('users')
      .select('*')
      .eq('unique_link', 'test-gents-1-unique-link')
      .single();

    expect(userError).toBeNull();
    expect(user).toBeDefined();
    expect(user.full_name).toBe('Test User Gents 1');

    // Step 2: User submits availability via unique link (simulating POST /api/availability)
    const availabilityDays = [1, 5, 10, 15, 20, 25]; // Available on these days
    const { data: availability, error: availError } = await supabaseAdmin
      .from('availability')
      .insert([{
        user_id: user.id,
        month: testMonth,
        available_days: availabilityDays
      }])
      .select()
      .single();

    expect(availError).toBeNull();
    expect(availability).toBeDefined();
    expect(availability.available_days).toEqual(availabilityDays);

    // Submit availability for other users too (need multiple users for algorithm)
    await supabaseAdmin
      .from('availability')
      .insert([
        {
          user_id: testUserIds[1],
          month: testMonth,
          available_days: [1, 2, 3, 10, 15, 16, 20]
        },
        {
          user_id: testUserIds[2],
          month: testMonth,
          available_days: [1, 5, 10, 12, 15, 20, 25]
        },
        {
          user_id: testUserIds[3],
          month: testMonth,
          available_days: [1, 2, 5, 10, 15, 18, 20, 25]
        }
      ]);

    // Step 3: Admin runs scheduling algorithm
    const scheduleResult = await generateMonthlySchedule(testMonth);

    expect(scheduleResult).toBeDefined();
    expect(scheduleResult.success).toBe(true);
    expect(scheduleResult.stats).toBeDefined();
    expect(scheduleResult.stats.filledSlots).toBeGreaterThan(0);

    // Apply the schedule to the database
    const applyResult = await applySchedule(testMonth, scheduleResult.assignments);
    expect(applyResult.success).toBe(true);

    // Step 4: Admin views schedule and sees user's assignments
    const { data: userAssignments, error: assignError} = await supabaseAdmin
      .from('schedules')
      .select('*')
      .eq('month', testMonth)
      .eq('assigned_user_id', user.id);

    expect(assignError).toBeNull();
    expect(userAssignments).toBeDefined();
    expect(userAssignments.length).toBeGreaterThan(0);

    // Verify user is only assigned to days they're available
    userAssignments.forEach(assignment => {
      expect(availabilityDays).toContain(assignment.day);
    });

    console.log(`✅ Test passed: User ${user.full_name} successfully assigned to ${userAssignments.length} duties`);
  });

  /**
   * Test 2: Remove user from day → verify can reassign
   *
   * Scenario:
   * 1. Initial schedule generated with user assignments
   * 2. Admin removes user from a specific day
   * 3. Verify user can be reassigned to that day again
   */
  test('Remove user from day, then reassign to same day', async () => {
    // Step 1: Set up initial availability and generate schedule
    const availabilityDays = [5, 10, 15, 20];

    // Submit availability for all test users
    await supabaseAdmin
      .from('availability')
      .insert([
        {
          user_id: testUserIds[0],
          month: testMonth,
          available_days: availabilityDays
        },
        {
          user_id: testUserIds[1],
          month: testMonth,
          available_days: [1, 5, 10, 15, 20, 25]
        },
        {
          user_id: testUserIds[2],
          month: testMonth,
          available_days: [5, 10, 15, 20]
        },
        {
          user_id: testUserIds[3],
          month: testMonth,
          available_days: [1, 5, 10, 15, 20, 25]
        }
      ]);

    // Generate initial schedule
    const initialSchedule = await generateMonthlySchedule(testMonth);
    expect(initialSchedule.success).toBe(true);
    expect(initialSchedule.stats.filledSlots).toBeGreaterThan(0);

    // Find an assignment for our test user on day 10
    const { data: userAssignments, error: findError } = await supabaseAdmin
      .from('schedules')
      .select('*')
      .eq('assigned_user_id', testUserIds[0])
      .eq('month', testMonth)
      .eq('day', 10);

    expect(findError).toBeNull();

    // If user is not assigned to day 10, manually create an assignment for testing
    let testAssignment;
    if (!userAssignments || userAssignments.length === 0) {
      const { data: newAssignment, error: insertError } = await supabaseAdmin
        .from('schedules')
        .insert([{
          assigned_user_id: testUserIds[0],
          month: testMonth,
          day: 10,
          duty_type: 'early_paat_gents_1'
        }])
        .select()
        .single();

      expect(insertError).toBeNull();
      testAssignment = newAssignment;
    } else {
      testAssignment = userAssignments[0];
    }

    expect(testAssignment).toBeDefined();
    console.log(`Initial assignment created: User ${testUserIds[0]} on ${testAssignment.month}-${testAssignment.day}, ${testAssignment.duty_type}`);

    // Step 2: Admin removes user from day 10
    const { error: deleteError } = await supabaseAdmin
      .from('schedules')
      .delete()
      .eq('id', testAssignment.id);

    expect(deleteError).toBeNull();

    // Verify assignment was deleted
    const { data: deletedCheck, error: checkError } = await supabaseAdmin
      .from('schedules')
      .select('*')
      .eq('id', testAssignment.id);

    expect(checkError).toBeNull();
    expect(deletedCheck).toHaveLength(0);
    console.log(`✅ Assignment removed successfully`);

    // Step 3: Verify user can be reassigned to the same day
    const { data: reassignment, error: reassignError } = await supabaseAdmin
      .from('schedules')
      .insert([{
        assigned_user_id: testUserIds[0],
        month: testAssignment.month,
        day: testAssignment.day,
        duty_type: testAssignment.duty_type
      }])
      .select()
      .single();

    expect(reassignError).toBeNull();
    expect(reassignment).toBeDefined();
    expect(reassignment.assigned_user_id).toBe(testUserIds[0]);
    expect(reassignment.month).toBe(testAssignment.month);
    expect(reassignment.day).toBe(testAssignment.day);

    console.log(`✅ User successfully reassigned to day ${reassignment.month}-${reassignment.day}, ${reassignment.duty_type}`);

    // Verify no duplicate assignments exist for same user/day/duty_type
    const { data: duplicateCheck, error: dupError } = await supabaseAdmin
      .from('schedules')
      .select('*')
      .eq('assigned_user_id', testUserIds[0])
      .eq('month', testAssignment.month)
      .eq('day', testAssignment.day)
      .eq('duty_type', testAssignment.duty_type);

    expect(dupError).toBeNull();
    expect(duplicateCheck).toHaveLength(1);
    console.log(`✅ No duplicate assignments found`);
  });

  /**
   * Test 3: Verify user can only be assigned to days they're available
   */
  test('User is only assigned to days marked as available', async () => {
    const availableDays = [1, 15, 30];

    // Submit limited availability
    await supabaseAdmin
      .from('availability')
      .insert([
        {
          user_id: testUserIds[0],
          month: testMonth,
          available_days: availableDays
        },
        {
          user_id: testUserIds[1],
          month: testMonth,
          available_days: [1, 5, 10, 15, 20, 25, 30]
        },
        {
          user_id: testUserIds[2],
          month: testMonth,
          available_days: [1, 5, 10, 15, 20, 25, 30]
        },
        {
          user_id: testUserIds[3],
          month: testMonth,
          available_days: [1, 5, 10, 15, 20, 25, 30]
        }
      ]);

    // Generate schedule
    await generateMonthlySchedule(testMonth);

    // Check all assignments for test user
    const { data: assignments, error } = await supabaseAdmin
      .from('schedules')
      .select('*')
      .eq('month', testMonth)
      .eq('assigned_user_id', testUserIds[0]);

    expect(error).toBeNull();

    // Verify each assignment is on an available day
    assignments.forEach(assignment => {
      expect(availableDays).toContain(assignment.day);
    });

    console.log(`✅ All ${assignments.length} assignments are on available days`);
  });
});
