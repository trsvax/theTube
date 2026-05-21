# Design — Jolt, Coffee, Prosecco

## Implementation approach

No code. This is a convention enforced by steering and agent behavior.

### Steering rule

Add to `.kiro/steering/` a rule that instructs the agent to:

1. When promoting a post from `vague-thought` to `thought`: ask/estimate jolt, set it
2. When ending a session that involved substantive work on a post: increment coffee
3. When publishing a post: calculate and set prosecco

### Frontmatter schema update

Update `docs/content.md` to document the three fields:

```yaml
jolt: 3      # estimate — set at thought transition
coffee: 2    # effort — incremented per session
prosecco: 0  # celebration — derived at publish
```

### Query patterns

```bash
# What's in progress (has coffee but no prosecco)
grep -l "coffee: [1-9]" content/posts/*.md | xargs grep -l "prosecco: 0"

# What shipped well (prosecco > 1)
grep -l "prosecco: [2-9]" content/posts/*.md

# Calibration: jolt vs coffee across all posts
grep "jolt:\|coffee:" content/posts/*.md
```

### No automation needed

The agent follows the convention via steering. No hooks, no Lambda, no build step. It's a number in a file that the agent updates when appropriate.
