// Standalone unit and boundary logic test script for DevFlow Community Platform
// Tests core logic rules for all 6 Elevance Skills internship tasks + Stack Overflow Q&A
// NOTE: These tests use self-contained mock functions; they are unit & boundary logic checks,
// not browser E2E tests, and do not independently verify actual application workflows.

import assert from "node:assert";

console.log("================================================================");
console.log("   DEVFLOW: UNIT & BOUNDARY LOGIC CHECKS TEST SUITE             ");
console.log("   (Self-contained logic rules; not browser E2E workflows)      ");
console.log("================================================================\n");

let passedTests = 0;
let totalTests = 0;

function runTest(name, fn) {
  totalTests++;
  try {
    fn();
    console.log(`  [PASS] ${name}`);
    passedTests++;
  } catch (err) {
    console.error(`  [FAIL] ${name}: ${err.message}`);
  }
}

// ============================================================================
// 1. CORE STACK OVERFLOW Q&A TESTS
// ============================================================================
console.log("\n--- SECTION 1: CORE STACK OVERFLOW Q&A FOUNDATION ---");

runTest("Milestone tracking: Question 10+ upvotes awards +2 points strictly ONCE (Idempotent)", () => {
  const awardedMilestones = [];
  let authorRep = 100;

  function handleVote(newScore) {
    if (newScore >= 10 && !awardedMilestones.includes("10_votes")) {
      awardedMilestones.push("10_votes");
      authorRep += 2;
    }
  }

  // Vote up to 10
  handleVote(10);
  assert.strictEqual(authorRep, 102);
  assert.deepStrictEqual(awardedMilestones, ["10_votes"]);

  // Vote up to 12
  handleVote(12);
  assert.strictEqual(authorRep, 102, "Should NOT award points again on higher score");

  // Vote down to 9 and back to 10
  handleVote(9);
  handleVote(10);
  assert.strictEqual(authorRep, 102, "Should NOT re-award points when score oscillates across boundary");
});

runTest("Milestone tracking: Answer 5+ upvotes awards +5 points strictly ONCE", () => {
  const awardedMilestones = [];
  let authorRep = 50;

  function handleVote(newScore) {
    if (newScore >= 5 && !awardedMilestones.includes("5_votes")) {
      awardedMilestones.push("5_votes");
      authorRep += 5;
    }
  }

  handleVote(5);
  assert.strictEqual(authorRep, 55);
  handleVote(6);
  assert.strictEqual(authorRep, 55);
  handleVote(4);
  handleVote(5);
  assert.strictEqual(authorRep, 55);
});

runTest("Accepted answer: Question author marking accepted solution awards +10 points to answer author", () => {
  const questionAuthorId = "user-amar";
  const answerAuthorId = "user-sarah";
  let sarahRep = 150;
  const milestones = [];

  function markAccepted(targetAuthorId) {
    if (targetAuthorId !== questionAuthorId && !milestones.includes("accepted")) {
      milestones.push("accepted");
      sarahRep += 10;
    }
  }

  markAccepted(answerAuthorId);
  assert.strictEqual(sarahRep, 160);
  // Mark again
  markAccepted(answerAuthorId);
  assert.strictEqual(sarahRep, 160, "Cannot award accepted points twice");
});

runTest("Self-acceptance guard: Question author accepting their own answer does NOT award reputation", () => {
  const questionAuthorId = "user-amar";
  let amarRep = 200;

  function markAccepted(targetAuthorId) {
    if (targetAuthorId !== questionAuthorId) {
      amarRep += 10;
    }
  }

  markAccepted(questionAuthorId);
  assert.strictEqual(amarRep, 200, "Self-accepted answers must not inflate user reputation");
});

runTest("Self-voting prevention: Users cannot upvote or downvote their own content", () => {
  const currentUserId = "user-amar";
  const question = { authorId: "user-amar", votes: 5 };

  function canVote(authorId) {
    return authorId !== currentUserId;
  }

  assert.strictEqual(canVote(question.authorId), false, "Self-voting must be disallowed");
});

runTest("Question voting: Toggling, direction switching (-1 to +1), and two-way author rep adjustment", () => {
  let authorRep = 100;
  const question = {
    id: "q-test",
    authorId: "user-sarah",
    votes: 7,
    votedUserIds: {},
  };

  function vote(userId, direction) {
    if (userId === question.authorId) return { success: false, message: "Self vote disallowed" };
    const current = question.votedUserIds[userId] || 0;
    if (current === direction) {
      delete question.votedUserIds[userId];
      question.votes -= direction;
      if (direction === -1) authorRep += 2; // downvote removed: restore rep
    } else {
      question.votedUserIds[userId] = direction;
      question.votes += current === 0 ? direction : direction * 2;
      if (current === -1) authorRep += 2; // previous downvote undone: restore rep
      if (direction === -1) authorRep -= 2; // downvoted: deduct rep
    }
    return { success: true, score: question.votes };
  }

  // User amar upvotes Sarah's question (+1) -> score goes to 8
  assert.strictEqual(vote("user-amar", 1).score, 8);
  assert.strictEqual(authorRep, 100);

  // User amar clicks upvote again -> toggles off back to 7
  assert.strictEqual(vote("user-amar", 1).score, 7);
  assert.strictEqual(question.votedUserIds["user-amar"], undefined);

  // User amar downvotes Sarah's question (-1) -> score drops to 6, author rep drops by 2 to 98
  assert.strictEqual(vote("user-amar", -1).score, 6);
  assert.strictEqual(authorRep, 98);

  // User amar switches vote to upvote (+1) -> score goes from 6 to 8 (+2 diff), author rep restored to 100
  assert.strictEqual(vote("user-amar", 1).score, 8);
  assert.strictEqual(authorRep, 100);
});

runTest("Answer posting: Minimum 20-character validation, question answer count increment, and +5 reputation reward", () => {
  let userRep = 50;
  const question = { id: "q-1", answersCount: 1, isClosed: false };
  const answers = [];

  function submitAnswer(user, qId, body) {
    if (!user) return { success: false, message: "Unauthenticated" };
    if (user.isSuspended) return { success: false, message: "Suspended" };
    if (question.isClosed) return { success: false, message: "Closed" };
    if (body.trim().length < 20) return { success: false, message: "Too short" };

    answers.push({ id: "ans-new", body: body.trim(), authorId: user.id });
    question.answersCount += 1;
    userRep += 5;
    return { success: true };
  }

  // Short answer (< 20 chars) fails
  assert.strictEqual(submitAnswer({ id: "user-amar" }, "q-1", "Too short!").success, false);
  assert.strictEqual(question.answersCount, 1);
  assert.strictEqual(userRep, 50);

  // Valid 20+ char answer succeeds, increments answer count, and awards +5 rep
  const validBody = "This is a comprehensive, valid answer exceeding twenty characters.";
  const res = submitAnswer({ id: "user-amar" }, "q-1", validBody);
  assert.strictEqual(res.success, true);
  assert.strictEqual(question.answersCount, 2);
  assert.strictEqual(userRep, 55);
});

runTest("Accept answer: Author or admin authorization, switching accepted answer, and unaccept toggle", () => {
  const question = { id: "q-1", authorId: "user-amar", acceptedAnswerId: undefined };
  let answers = [
    { id: "ans-1", questionId: "q-1", authorId: "user-sarah", isAccepted: false, awardedMilestones: [] },
    { id: "ans-2", questionId: "q-1", authorId: "user-alex", isAccepted: false, awardedMilestones: [] },
  ];
  let sarahRep = 100;
  let alexRep = 200;

  function accept(actingUser, answerId) {
    if (actingUser.id !== question.authorId && actingUser.role !== "admin") {
      return { success: false, message: "Unauthorized" };
    }
    const isAlreadyAccepted = question.acceptedAnswerId === answerId;
    if (isAlreadyAccepted) {
      question.acceptedAnswerId = undefined;
      answers = answers.map((a) => ({ ...a, isAccepted: false }));
      return { success: true, action: "unaccepted" };
    }

    const target = answers.find((a) => a.id === answerId);
    if (target.authorId !== question.authorId && !target.awardedMilestones.includes("accepted")) {
      target.awardedMilestones.push("accepted");
      if (target.authorId === "user-sarah") sarahRep += 10;
      if (target.authorId === "user-alex") alexRep += 10;
    }

    question.acceptedAnswerId = answerId;
    answers = answers.map((a) => ({ ...a, isAccepted: a.id === answerId }));
    return { success: true, action: "accepted" };
  }

  // Non-author non-admin cannot accept
  assert.strictEqual(accept({ id: "user-david", role: "user" }, "ans-1").success, false);

  // Author accepts ans-1
  const res1 = accept({ id: "user-amar", role: "user" }, "ans-1");
  assert.strictEqual(res1.action, "accepted");
  assert.strictEqual(question.acceptedAnswerId, "ans-1");
  assert.strictEqual(answers[0].isAccepted, true);
  assert.strictEqual(sarahRep, 110);

  // Author clicks ans-1 again -> toggles unaccepted
  const resToggle = accept({ id: "user-amar", role: "user" }, "ans-1");
  assert.strictEqual(resToggle.action, "unaccepted");
  assert.strictEqual(question.acceptedAnswerId, undefined);
  assert.strictEqual(answers[0].isAccepted, false);

  // Admin accepts ans-2 -> only ans-2 is accepted
  const resAdmin = accept({ id: "user-admin", role: "admin" }, "ans-2");
  assert.strictEqual(resAdmin.action, "accepted");
  assert.strictEqual(question.acceptedAnswerId, "ans-2");
  assert.strictEqual(answers[1].isAccepted, true);
  assert.strictEqual(answers[0].isAccepted, false);
  assert.strictEqual(alexRep, 210);
});

// ============================================================================
// 2. TASK 1: COMMUNITY FEED & SOCIAL INTERACTION
// ============================================================================
console.log("\n--- SECTION 2: TASK 1 - COMMUNITY FEED & SOCIAL INTERACTION ---");

runTest("Post types support: Technical updates, code snippets, project showcases, achievements", () => {
  const validTypes = ["update", "snippet", "showcase", "achievement"];
  const post = { type: "showcase", title: "My Next.js SSR Project", content: "#react #nextjs showcase" };
  assert.ok(validTypes.includes(post.type));
});

runTest("Content reporting requires 500+ reputation points privilege", () => {
  function canReport(reputation, role) {
    return reputation >= 500 || role === "admin";
  }

  assert.strictEqual(canReport(450, "user"), false);
  assert.strictEqual(canReport(500, "user"), true);
  assert.strictEqual(canReport(10, "admin"), true);
});

runTest("Admin review: Suspending user sets isSuspended: true and deducts 50 reputation points", () => {
  let user = { id: "bad-actor", reputation: 80, isSuspended: false };

  function adminSuspend(targetUser) {
    targetUser.isSuspended = true;
    targetUser.reputation = Math.max(0, targetUser.reputation - 50);
  }

  adminSuspend(user);
  assert.strictEqual(user.isSuspended, true);
  assert.strictEqual(user.reputation, 30);
});

// ============================================================================
// 3. TASK 2: FORGOT PASSWORD & LETTERS-ONLY PASSWORD GENERATOR
// ============================================================================
console.log("\n--- SECTION 3: TASK 2 - FORGOT PASSWORD & PASSWORD GENERATOR ---");

runTest("Letters-only password generator: strictly [A-Za-z], NO numbers, NO special characters", () => {
  function generateLettersOnlyPassword(length = 12) {
    const upper = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
    const lower = "abcdefghijklmnopqrstuvwxyz";
    const all = upper + lower;
    let pass = "";
    pass += upper[Math.floor(Math.random() * upper.length)];
    pass += lower[Math.floor(Math.random() * lower.length)];
    for (let i = 2; i < length; i++) {
      pass += all[Math.floor(Math.random() * all.length)];
    }
    return pass;
  }

  for (let trial = 0; trial < 100; trial++) {
    const pass = generateLettersOnlyPassword(14);
    assert.strictEqual(pass.length, 14);
    // MUST match strictly uppercase and lowercase letters only
    assert.ok(/^[A-Za-z]+$/.test(pass), `Generated password "${pass}" contained non-letter characters!`);
    assert.ok(!/[0-9]/.test(pass), "Password must NOT contain numbers");
    assert.ok(!/[!@#$%^&*(),.?":{}|<>]/.test(pass), "Password must NOT contain special characters");
  }
});

runTest("Strict rate-limiting: Only 1 forgot password request per calendar day with exact required warning", () => {
  const today = new Date().toISOString().split("T")[0];
  let lastRequestedDate = null;

  function requestForgotPassword() {
    if (lastRequestedDate === today) {
      return {
        success: false,
        message: "You can use this option only one time per day.",
      };
    }
    lastRequestedDate = today;
    return { success: true, message: "OTP challenge sent." };
  }

  // Request 1: succeeds
  const res1 = requestForgotPassword();
  assert.strictEqual(res1.success, true);

  // Request 2 on same day: fails with exact text
  const res2 = requestForgotPassword();
  assert.strictEqual(res2.success, false);
  assert.strictEqual(res2.message, "You can use this option only one time per day.");
});

// ============================================================================
// 4. TASK 3: SUBSCRIPTION & PREMIUM MEMBERSHIP
// ============================================================================
console.log("\n--- SECTION 4: TASK 3 - SUBSCRIPTION & PREMIUM MEMBERSHIP ---");

runTest("Daily question quotas enforced by plan tier", () => {
  const quotas = {
    free: 1,
    bronze: 5,
    silver: 15,
    gold: "unlimited",
  };

  function checkCanAsk(tier, questionsToday) {
    const limit = quotas[tier];
    if (limit === "unlimited") return true;
    return questionsToday < limit;
  }

  assert.strictEqual(checkCanAsk("free", 0), true);
  assert.strictEqual(checkCanAsk("free", 1), false);
  assert.strictEqual(checkCanAsk("bronze", 4), true);
  assert.strictEqual(checkCanAsk("bronze", 5), false);
  assert.strictEqual(checkCanAsk("silver", 14), true);
  assert.strictEqual(checkCanAsk("silver", 15), false);
  assert.strictEqual(checkCanAsk("gold", 999), true);
});

runTest("Invoice tax breakdown calculation: 18% GST (Subtotal + IGST = Total)", () => {
  const amount = 299; // Silver plan
  const subtotal = Number((amount / 1.18).toFixed(2));
  const igst = Number((amount - subtotal).toFixed(2));
  const calculatedTotal = Number((subtotal + igst).toFixed(2));

  assert.strictEqual(calculatedTotal, amount);
  assert.strictEqual(subtotal, 253.39);
  assert.strictEqual(igst, 45.61);
});

// ============================================================================
// 5. TASK 4: REPUTATION SYSTEM & TRANSFERS
// ============================================================================
console.log("\n--- SECTION 5: TASK 4 - REPUTATION REWARDS & TRANSFERS ---");

runTest("Reputation transfer validations: sender > 50 rep, max 50/tx, max 100/day, no self-transfer", () => {
  function validateTransfer(senderRep, senderId, receiverId, amount, todaySent) {
    if (senderId === receiverId) return { allowed: false, reason: "Self-transfer disallowed" };
    if (senderRep <= 50) return { allowed: false, reason: "Sender must have > 50 reputation points" };
    if (amount <= 0 || amount > 50) return { allowed: false, reason: "Max 50 points per transaction" };
    if (todaySent + amount > 100) return { allowed: false, reason: "Daily transfer limit is 100 points" };
    if (senderRep < amount) return { allowed: false, reason: "Insufficient balance" };
    return { allowed: true };
  }

  // Sender with 50 points (fails: must have > 50)
  assert.strictEqual(validateTransfer(50, "u1", "u2", 10, 0).allowed, false);

  // Sender with 51 points, sends 10 (passes)
  assert.strictEqual(validateTransfer(51, "u1", "u2", 10, 0).allowed, true);

  // Transfer 55 points in one transaction (fails: max 50)
  assert.strictEqual(validateTransfer(100, "u1", "u2", 55, 0).allowed, false);

  // Transfer exceeds daily cap of 100
  assert.strictEqual(validateTransfer(200, "u1", "u2", 50, 60).allowed, false);

  // Self transfer
  assert.strictEqual(validateTransfer(100, "u1", "u1", 10, 0).allowed, false);
});

runTest("Reputation triggers: -2 on downvotes, -5 on answer deletion, -10 on admin content removal", () => {
  let rep = 100;
  // Downvote received
  rep -= 2;
  assert.strictEqual(rep, 98);
  // User deletes own answer
  rep -= 5;
  assert.strictEqual(rep, 93);
  // Admin removes guideline violating content
  rep -= 10;
  assert.strictEqual(rep, 83);
});

// ============================================================================
// 6. TASK 5: MULTI-LANGUAGE OTP VERIFICATION
// ============================================================================
console.log("\n--- SECTION 6: TASK 5 - MULTI-LANGUAGE OTP VERIFICATION ---");

runTest("Channel routing: French requires EMAIL OTP; other 5 languages require MOBILE OTP", () => {
  function getOtpChannel(lang) {
    return lang === "fr" ? "email" : "mobile";
  }

  assert.strictEqual(getOtpChannel("fr"), "email", "French must require Email OTP");
  assert.strictEqual(getOtpChannel("en"), "mobile");
  assert.strictEqual(getOtpChannel("es"), "mobile");
  assert.strictEqual(getOtpChannel("hi"), "mobile");
  assert.strictEqual(getOtpChannel("pt"), "mobile");
  assert.strictEqual(getOtpChannel("zh"), "mobile");
});

runTest("Language switch blocked until correct OTP is verified", () => {
  let currentLanguage = "en";
  const expectedOtp = "549102";

  function applyLanguage(enteredOtp, newLang) {
    if (enteredOtp !== expectedOtp) {
      return { success: false, message: "Invalid OTP" };
    }
    currentLanguage = newLang;
    return { success: true };
  }

  // Incorrect OTP
  const failed = applyLanguage("000000", "fr");
  assert.strictEqual(failed.success, false);
  assert.strictEqual(currentLanguage, "en");

  // Correct OTP
  const succeeded = applyLanguage("549102", "fr");
  assert.strictEqual(succeeded.success, true);
  assert.strictEqual(currentLanguage, "fr");
});

// ============================================================================
// 7. TASK 6: LOGIN SESSIONS & DEVICE MANAGEMENT
// ============================================================================
console.log("\n--- SECTION 7: TASK 6 - LOGIN SESSIONS & DEVICE MANAGEMENT ---");

runTest("Session tracking: Multiple active sessions and remote revocation", () => {
  let sessions = [
    { id: "s1", browser: "Chrome", os: "Windows", isCurrent: true },
    { id: "s2", browser: "Safari", os: "iOS", isCurrent: false },
    { id: "s3", browser: "Firefox", os: "Linux", isCurrent: false },
  ];

  function revokeSession(sessionId) {
    sessions = sessions.filter((s) => s.id !== sessionId);
  }

  revokeSession("s2");
  assert.strictEqual(sessions.length, 2);
  assert.strictEqual(sessions.some((s) => s.id === "s2"), false);

  function revokeAllOther() {
    sessions = sessions.filter((s) => s.isCurrent);
  }

  revokeAllOther();
  assert.strictEqual(sessions.length, 1);
  assert.strictEqual(sessions[0].id, "s1");
});

runTest("Session isolation: User-scoped revocation and logout state clearing", () => {
  let allSessions = [
    { id: "s-amar-1", userId: "user-amar", isCurrent: true },
    { id: "s-amar-2", userId: "user-amar", isCurrent: false },
    { id: "s-sarah-1", userId: "user-sarah", isCurrent: true },
  ];
  let currentUser = { id: "user-amar" };

  function getUserSessions(uid) {
    return allSessions.filter((s) => s.userId === uid);
  }

  function revokeAllOther(user) {
    allSessions = allSessions.filter((s) => s.userId !== user.id || s.isCurrent);
  }

  function logout() {
    allSessions = allSessions.map((s) => (s.userId === currentUser.id && s.isCurrent ? { ...s, isCurrent: false } : s));
    currentUser = null;
  }

  // Amar only sees his 2 sessions
  assert.strictEqual(getUserSessions("user-amar").length, 2);

  // Amar revokes all other sessions -> s-amar-2 removed, but s-sarah-1 is completely untouched!
  revokeAllOther(currentUser);
  assert.strictEqual(allSessions.length, 2);
  assert.strictEqual(allSessions.some((s) => s.id === "s-sarah-1"), true);
  assert.strictEqual(allSessions.some((s) => s.id === "s-amar-1"), true);
  assert.strictEqual(allSessions.some((s) => s.id === "s-amar-2"), false);

  // Amar logs out -> currentUser becomes null and current session is no longer current
  logout();
  assert.strictEqual(currentUser, null);
  assert.strictEqual(allSessions.find((s) => s.id === "s-amar-1").isCurrent, false);
});

runTest("Share functionality: Graceful AbortError handling and conditional counter increment", () => {
  let shareCount = 5;

  function handleShareResult(result) {
    if (result.success) {
      shareCount += 1;
      return "Link copied!";
    }
    if (result.method === "cancelled") {
      return "Share cancelled.";
    }
    return "Failed to share.";
  }

  // User aborts native share modal -> no increment
  const cancelledRes = handleShareResult({ success: false, method: "cancelled" });
  assert.strictEqual(cancelledRes, "Share cancelled.");
  assert.strictEqual(shareCount, 5, "Share count must NOT increment on cancellation");

  // User successfully shares or copies -> counter increments
  const successRes = handleShareResult({ success: true, method: "clipboard" });
  assert.strictEqual(successRes, "Link copied!");
  assert.strictEqual(shareCount, 6, "Share count must increment on true success");
});

runTest("Suspension guard: Suspended users are barred from questions, answers, posts, comments, votes", () => {
  const suspendedUser = { isSuspended: true };

  function checkActionAllowed(user) {
    if (user.isSuspended) {
      return { allowed: false, message: "Account is suspended." };
    }
    return { allowed: true };
  }

  assert.strictEqual(checkActionAllowed(suspendedUser).allowed, false);
});

// ============================================================================
// SUMMARY
// ============================================================================
console.log("\n================================================================");
console.log(`   TOTAL LOGIC CHECKS: ${totalTests} | PASSED: ${passedTests} | FAILED: ${totalTests - passedTests}`);
if (passedTests === totalTests) {
  console.log(`   RESULT: ALL ${totalTests} LOGIC & BOUNDARY CHECKS PASSED`);
} else {
  console.log("   RESULT: SOME LOGIC CHECKS FAILED");
}
console.log("================================================================\n");
