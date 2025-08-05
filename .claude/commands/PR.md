# Pull Request Workflow for Claude Code Projects

## Pre-PR Checklist
- [ ] Code has been tested with `claude-code` locally
- [ ] All existing tests pass
- [ ] New tests added for new functionality
- [ ] Documentation updated if needed
- [ ] Code follows project style guidelines

## PR Title Format
`[type]: brief description`

Types: feat, fix, docs, refactor, test, chore

## PR Description Template

### Summary
Brief description of changes and motivation

### Changes
- List key modifications
- Note any breaking changes
- Mention dependency updates

### Claude Code Specific
- [ ] Tested with latest Claude Code version
- [ ] Updated .claude-code config if needed
- [ ] Verified prompts work as expected
- [ ] Documentation reflects Claude Code usage

### Testing
- [ ] Unit tests pass
- [ ] Integration tests pass
- [ ] Manual testing completed

### Review Notes
Any specific areas that need reviewer attention

## Merge Requirements
- At least 1 approval from code owner
- All CI checks passing
- No merge conflicts
- Documentation updated