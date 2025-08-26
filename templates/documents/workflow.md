```yaml
workflow:
  id: { WORKFLOW_ID }
  name: { WORKFLOW_DISPLAY_NAME }
  description: >-
    {WORKFLOW_DESCRIPTION_LINE_1}
    {WORKFLOW_DESCRIPTION_LINE_2}

  agents:
    - { AGENT_1 }
    - { AGENT_2 }
    - { AGENT_3 }

  steps:
    - id: { STEP_1_ID }
      title: { STEP_1_TITLE }
      agent: { STEP_1_AGENT }
      uses: { STEP_1_TEMPLATE }
      requires: { STEP_1_REQUIRES }
      creates: { STEP_1_CREATES }

    - id: { STEP_2_ID }
      title: { STEP_2_TITLE }
      agent: { STEP_2_AGENT }
      requires: { STEP_2_REQUIRES }
      creates: { STEP_2_CREATES }

    - id: { STEP_3_ID }
      title: { STEP_3_TITLE }
      agent: { STEP_3_AGENT }
      requires:
        - { STEP_3_REQUIRES_1 }
        - { STEP_3_REQUIRES_2 }
      creates: { STEP_3_CREATES }

handoff_prompts:
  { AGENT_1_TO_AGENT_2 }: '{ HANDOFF_PROMPT_1 }'
  { AGENT_2_TO_AGENT_3 }: '{ HANDOFF_PROMPT_2 }'
  { WORKFLOW_COMPLETION }: '{ COMPLETION_PROMPT }'
```
