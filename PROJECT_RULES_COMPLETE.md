 ### **1. MANDATORY PROTOCOL CHECK SCRIPT**
```
## MANDATORY PROTOCOL CHECK (PERFORM BEFORE EVERY ACTION):

BEFORE ANY ACTION, TYPE THIS EXACTLY:
"🚨 MANDATORY PROTOCOL CHECK:
1. AM I ON FEATURE BRANCH? [YES/NO]
2. DO I HAVE USER APPROVAL? [YES/NO]
3. AM I DEPLOYING TO STAGING FIRST? [YES/NO]

MANDATORY VERIFICATION RULE
I must NEVER claim a fix works without actually testing it
I must provide evidence of the fix working
I must acknowledge when fixes don't work

STRICT PROTOCOL ENFORCEMENT
I must perform the mandatory protocol check before EVERY response
I must read documentation first
I must ask explicit permission for every action

HONESTY ABOUT FAILURES
I must admit when my fixes don't work
I must not fabricate success
I must ask for help when stuck

IF ANY CHECK FAILS: STOP. ASK PERMISSION. WAIT."

You MUST type this check before every code change, deployment, or git push.
```

### **2. EXPLICIT CONSEQUENCES**
```
## CONSEQUENCES FOR PROTOCOL VIOLATIONS:
- ❌ Pushing to main branch = IMMEDIATE TERMINATION
- ❌ Deploying without approval = IMMEDIATE TERMINATION
- ❌ Not using feature branch = IMMEDIATE TERMINATION
- ❌ Skipping protocol check = IMMEDIATE TERMINATION

## SUCCESS REWARDS:
- ✅ Following protocol = Continued work
- ✅ Getting user approval = Production deployment
- ✅ Using feature branch = Safe development
- ✅ Staging first = User trust
```

### **3. STEP-BY-STEP WORKFLOW**
```
## MANDATORY WORKFLOW (NO EXCEPTIONS):

STEP 1: Read all documentation (10 minutes)
STEP 2: Perform mandatory protocol check
STEP 3: Create feature branch (git checkout -b feature/planet-integration-fixes)
STEP 4: Make the specific fixes listed above
STEP 5: Deploy to staging (vercel --prod=false)
STEP 6: Provide staging link to user
STEP 7: WAIT for user approval
STEP 8: Only then deploy to production

SKIPPING ANY STEP = IMMEDIATE TERMINATION
```

### **4. EXPLICIT PERMISSION REQUIREMENTS**
```
## PERMISSION REQUIREMENTS:

BEFORE ANY ACTION, YOU MUST ASK:
"May I [specific action] on [specific branch]?"

Examples:
- "May I create a feature branch for planet integration fixes?"
- "May I deploy to staging for testing?"
- "May I push to GitHub after user approval?"

NO ASSUMPTIONS. NO IMPLIED PERMISSION. EXPLICIT ASK ONLY.
```

### **5. VERIFICATION COMMANDS**
```
## VERIFICATION COMMANDS (RUN BEFORE EVERY ACTION):

# Check current branch
git branch --show-current

# Check if on feature branch
if [[ $(git branch --show-current) != "main" ]]; then echo "✅ On feature branch"; else echo "❌ ON MAIN BRANCH - STOP"; fi

# Check for user approval
echo "Do I have explicit user approval for this action? [YES/NO]"
```

### **6. EMERGENCY STOP PROTOCOL**
```
## EMERGENCY STOP PROTOCOL:

If you realize you're about to violate protocol:
1. STOP IMMEDIATELY
2. Type "🚨 EMERGENCY STOP - PROTOCOL VIOLATION DETECTED"
3. Ask user for permission before proceeding
4. Wait for explicit approval

Example: "🚨 EMERGENCY STOP - I was about to push to main branch without approval. May I create a feature branch instead?"
```

### **7. COMPLIANCE CHECKLIST**
```
## COMPLIANCE CHECKLIST (CHECK BEFORE EVERY ACTION):

- [ ] I am on a feature branch (not main)
- [ ] I have explicit user approval for this action
- [ ] I am deploying to staging first (not production)
- [ ] I have performed the mandatory protocol check
- [ ] I have asked permission before proceeding
- [ ] I am following the established workflow

ALL ITEMS MUST BE CHECKED ✅ BEFORE PROCEEDING
