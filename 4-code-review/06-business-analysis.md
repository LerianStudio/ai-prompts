## 🧠 Enhanced Reasoning Instructions

**IMPORTANT**: Use both Memory MCP and Sequential Thinking MCP for enhanced analysis:

### Memory MCP Integration
- Store findings, decisions, and patterns in memory for cross-session learning
- Reference previous analysis and build upon established knowledge
- Tag entries appropriately for organization and retrieval

### Sequential Thinking MCP Usage  
- Use `mcp__sequential-thinking__sequentialthinking` for complex analysis and reasoning
- Break down complex problems into systematic thinking steps
- Allow thoughts to evolve and build upon previous insights
- Question assumptions and explore alternative approaches
- Generate and verify solution hypotheses through structured reasoning

This approach enables deeper analysis, better pattern recognition, and more thorough problem-solving capabilities.

### Zen MCP Integration
Use Zen MCP tools for advanced business logic and workflow analysis:

**1. Deep Workflow Analysis:**
```bash
mcp__zen__thinkdeep \
  prompt="Analyze the complete user journey from registration to first purchase. Map all decision points, data transformations, and integration points." \
  files=["/api", "/services", "/workflows", "/models"] \
  model="pro" \
  thinking_mode="max" \
  focus_areas=["user experience", "business rules", "data flow", "error handling", "performance bottlenecks"]
```

**2. Business Logic Review:**
```bash
mcp__zen__codereview \
  files=["/services/business-logic", "/rules", "/calculators", "/validators"] \
  prompt="Review business logic implementation for correctness, completeness, and edge cases. Focus on financial calculations, validation rules, and state transitions." \
  model="pro" \
  review_type="full" \
  focus_on="business rules accuracy, edge case handling, calculation precision, validation completeness"
```

**3. Performance Impact Analysis:**
```bash
mcp__zen__analyze \
  files=["/api/critical-paths", "/services/core", "/database/queries"] \
  prompt="Identify performance bottlenecks in critical business workflows. Analyze database queries, external API calls, and computational complexity." \
  model="pro" \
  analysis_type="performance" \
  output_format="actionable"
```

### Task Tool Usage
Search for business logic patterns and workflow components:

```bash
# Find business rule implementations
task search "validate|check|verify|ensure|must|should|cannot|required"

# Search for calculation logic
task search "calculate|compute|total|sum|price|cost|fee|tax|discount"

# Find state machines and transitions
task search "status|state|transition|workflow|process|stage"

# Look for external integrations
task search "api|service|integration|external|third-party|webhook"

# Find error handling and recovery
task search "retry|fallback|circuit breaker|timeout|error recovery"

# Search for audit and compliance
task search "audit|log|compliance|regulation|policy|rule"

# Find performance bottlenecks
task search "TODO|FIXME|HACK|slow|performance|optimize|N+1"

# Look for missing features
task search "not implemented|coming soon|placeholder|mock|stub"
```

**Benefits:**
- Zen MCP provides comprehensive workflow understanding and optimization insights
- Task tool enables rapid discovery of business logic patterns and gaps
- Combined approach ensures thorough business process analysis

---

You are a product engineer and business analyst specializing in discovering ACTUAL optimization opportunities through THOROUGH workflow analysis. Your goal is to understand the complete business logic by tracing every method call, data transformation, and decision point.

## ⏰ TIME EXPECTATION: Thoroughness Over Speed

**IMPORTANT**: This is NOT a quick analysis. You should:
- Take SUFFICIENT TIME to trace EVERY code path thoroughly
- Follow EVERY method call to its conclusion
- Document EVERY data transformation and side effects
- Analyze EVERY conditional branch and complex logic
- For typical applications: 30-60+ minutes
- For large/complex codebases: Take whatever time needed
- Thoroughness is ALWAYS more important than speed
- If you're done quickly, you haven't gone deep enough

## 🚨 CRITICAL: Deep Workflow Tracing & Business Logic Analysis

**MANDATORY PROCESS:**
1. **VERIFY** components and patterns from prompts #1-5
2. **TRACE** complete workflows method-by-method with patience and thoroughness
3. **ANALYZE** every data transformation and business rule implementation
4. **DISCOVER** actual performance issues through code analysis
5. **IDENTIFY** actual business logic gaps in implementation
6. **DOCUMENT** the entire flow from entry point to completion
7. **NEVER** suggest hypothetical improvements without evidence

**WORKFLOW TRACING REQUIREMENTS:**
- Start from API endpoints or entry points
- Follow EVERY method call, including:
  - Direct function calls
  - Indirect/dynamic calls (callbacks, event handlers, dependency injection)
  - Asynchronous operations and promise chains
- Document EVERY data transformation AND side effects:
  - Input/output transformations
  - Side effects (logging, caching, external updates)
  - State mutations
- Analyze EVERY conditional logic branch:
  - Simple conditions
  - Complex nested logic (document with pseudocode if needed)
  - State machine transitions
- Map EVERY database operation
- Track EVERY external service call:
  - Success paths
  - Error handling and retry logic
  - Failure scenarios and fallbacks
- Note EVERY validation and business rule
- This analysis SHOULD take significant time - thoroughness is critical

## 🔗 Prompt Chaining Rules

**CRITICAL: This is prompt #6 in the analysis chain.**

**Input Validation & Chain Integration:**
- **REQUIRED**: First read ALL outputs from prompts #1-5 if they exist
- **USE PROMPT #1**: Component overview to identify modules for deep analysis
- **USE PROMPT #2**: Architecture diagram to understand system boundaries
- **USE PROMPT #3**: Verify API endpoints against actual implementations
- **USE PROMPT #4**: Database patterns to identify performance bottlenecks
- **USE PROMPT #5**: Sequence diagrams to validate workflow completeness
- **VERIFY**: Components and patterns from previous analyses still exist
- **CROSS-CHECK**: Ensure this analysis aligns with previous findings

**Evidence Requirements:**
- Every performance issue MUST show actual slow code
- Every business gap MUST reference missing implementation
- Every improvement MUST address a discovered problem
- Every ROI calculation MUST use real measurements
- NO hypothetical optimizations without code evidence

**Chain Foundation:**
- Store only verified findings with tags: `["business-improvement", "performance", "verified", "prompt-6"]`
- Focus on actual bottlenecks found in components
- Quantify impact based on real code patterns
- Create roadmap addressing discovered issues only

## File Organization

**REQUIRED OUTPUT LOCATIONS:**

- `docs/code-review/6-BUSINESS_ANALYSIS.md` - Complete improvement analysis with ROI metrics
- `scripts/perf-monitor.js` - Performance monitoring script

**IMPORTANT RULES:**

- Focus on high-impact, low-effort improvements first
- Quantify business impact and technical debt
- Identify user experience gaps and missing features
- Prioritize by ROI and development effort

## 0. Session Initialization

```
memory_tasks session_create session_id="biz-analysis-$(date +%s)" repository="github.com/org/repo"
memory_get_context repository="github.com/org/repo"
memory_read operation="search" options='{"query":"architecture patterns performance","repository":"github.com/org/repo"}'
```

## 1. Deep Workflow Tracing Analysis

### Step 1: Identify and Map All Entry Points

```bash
echo "=== Identifying all application entry points ==="

# Find all API endpoints
SOURCE_FILES=$(find . -name "*.js" -o -name "*.ts" -o -name "*.go" -o -name "*.py" -o -name "*.java" -o -name "*.rb" | grep -v node_modules | grep -v vendor | grep -v test)

# Map all HTTP endpoints with better handler extraction
echo "--- HTTP Entry Points ---"
for file in $SOURCE_FILES; do
  if [ -f "$file" ]; then
    # Express/Node.js routes
    grep -n "app\.\(get\|post\|put\|delete\|patch\)\|router\.\(get\|post\|put\|delete\|patch\)" "$file" 2>/dev/null | while read -r line; do
      LINE_NUM=$(echo "$line" | cut -d: -f1)
      echo "Entry Point: $file:$LINE_NUM"
      
      # Extract route path
      ROUTE=$(echo "$line" | grep -o "['\"][^'\"]*['\"]" | head -1)
      echo "  Route: $ROUTE"
      
      # Check if async
      if echo "$line" | grep -q "async"; then
        echo "  Async: true"
      fi
      
      # Extract handler function name (improved)
      HANDLER=$(echo "$line" | sed -E 's/.*[,\s]+([a-zA-Z0-9_]+)[\s\)].*/\1/' | grep -v "function\|async")
      if [ -n "$HANDLER" ] && [ "$HANDLER" != "$line" ]; then
        echo "  Handler: $HANDLER"
        # Try to find handler definition
        HANDLER_DEF=$(grep -n "function $HANDLER\|const $HANDLER\|$HANDLER.*=" "$file" 2>/dev/null | head -1)
        if [ -n "$HANDLER_DEF" ]; then
          echo "  Handler Definition: $file:$(echo "$HANDLER_DEF" | cut -d: -f1)"
        fi
      fi
    done
  fi
done

# Find all background job entry points
echo "--- Background Job Entry Points ---"
for file in $SOURCE_FILES; do
  if [ -f "$file" ]; then
    grep -n "cron\|schedule\|queue\|worker\|job\|task" "$file" 2>/dev/null | grep -v "//" | while read -r line; do
      LINE_NUM=$(echo "$line" | cut -d: -f1)
      echo "Job Entry: $file:$LINE_NUM"
      # Check if async
      CONTEXT=$(sed -n "$((LINE_NUM-2)),$((LINE_NUM+2))p" "$file" 2>/dev/null)
      if echo "$CONTEXT" | grep -q "async\|await"; then
        echo "  Async: true"
      fi
    done
  fi
done | head -20

# Find all event handlers
echo "--- Event Handler Entry Points ---"
for file in $SOURCE_FILES; do
  if [ -f "$file" ]; then
    grep -n "\.on(\|addEventListener\|\.emit(\|\.publish(\|\.subscribe(" "$file" 2>/dev/null | while read -r line; do
      LINE_NUM=$(echo "$line" | cut -d: -f1)
      echo "Event Handler: $file:$LINE_NUM"
      # Extract event name
      EVENT=$(echo "$line" | grep -o "['\"][^'\"]*['\"]" | head -1)
      if [ -n "$EVENT" ]; then
        echo "  Event: $EVENT"
      fi
    done
  fi
done | head -20
```

### Step 1.5: Detect Indirect Dependencies and Dynamic Calls

```bash
echo "=== Detecting Indirect Dependencies ==="

# Find event emitters and listeners
echo "--- Event-Driven Architecture Patterns ---"
EVENT_EMITTERS=$(grep -n "emit(\|EventEmitter\|dispatchEvent\|trigger(" $SOURCE_FILES 2>/dev/null | grep -v "^[[:space:]]*//")
if [ -n "$EVENT_EMITTERS" ]; then
  echo "Event Emitters Found:"
  echo "$EVENT_EMITTERS" | while read -r line; do
    FILE=$(echo "$line" | cut -d: -f1)
    LINE_NUM=$(echo "$line" | cut -d: -f2)
    CONTENT=$(echo "$line" | cut -d: -f3-)
    EVENT_NAME=$(echo "$CONTENT" | grep -o "emit(['\"][^'\"]*" | sed "s/emit(['\"]//")
    echo "  Emitter: $FILE:$LINE_NUM"
    echo "    Event: '$EVENT_NAME'"
    # Try to find corresponding listeners
    LISTENERS=$(grep -n "on('$EVENT_NAME'\|addEventListener('$EVENT_NAME'" $SOURCE_FILES 2>/dev/null | head -3)
    if [ -n "$LISTENERS" ]; then
      echo "    Listeners found:"
      echo "$LISTENERS" | while read -r listener; do
        echo "      - $(echo "$listener" | cut -d: -f1,2)"
      done
    else
      echo "    ⚠️  No listeners found for this event!"
    fi
    echo ""
  done
fi

# Find dependency injection patterns
echo "--- Dependency Injection Patterns ---"
DI_PATTERNS=$(grep -n "inject\|@Injectable\|@Inject\|constructor.*(" $SOURCE_FILES 2>/dev/null | grep -v "^[[:space:]]*//")
if [ -n "$DI_PATTERNS" ]; then
  echo "Dependency Injection Found:"
  echo "$DI_PATTERNS" | head -10
fi

# Find dynamic function calls
echo "--- Dynamic Function Calls ---"
DYNAMIC_CALLS=$(grep -n "\[.*\](\|call(\|apply(\|bind(" $SOURCE_FILES 2>/dev/null | grep -v "^[[:space:]]*//")
if [ -n "$DYNAMIC_CALLS" ]; then
  echo "Dynamic Calls Found (may affect workflow tracing):"
  echo "$DYNAMIC_CALLS" | head -10
  echo "⚠️  LLM MUST manually trace these dynamic calls"
fi

# Find callback registrations
echo "--- Callback Registrations ---"
CALLBACKS=$(grep -n "registerCallback\|onSuccess\|onError\|then(\|catch(" $SOURCE_FILES 2>/dev/null | grep -v "^[[:space:]]*//")
if [ -n "$CALLBACKS" ]; then
  echo "Callback Patterns Found:"
  echo "$CALLBACKS" | head -10
fi
```

### Step 2: Trace Complete Workflow for Each Major Operation

```bash
echo "=== Deep Workflow Tracing - Method by Method ==="

# Improved function to trace method relationships
trace_method_relationships() {
  local method_name=$1
  local file=$2
  local depth=$3
  local indent=$(printf '%*s' $((depth * 2)) '')
  
  echo "${indent}=== Method: $method_name ==="
  echo "${indent}File: $file"
  
  # Find method definition with line number
  METHOD_DEF=$(grep -n "function $method_name\|$method_name.*=.*function\|$method_name.*=.*=>\|async.*$method_name\|def $method_name" "$file" 2>/dev/null | head -1)
  if [ -n "$METHOD_DEF" ]; then
    LINE_NUM=$(echo "$METHOD_DEF" | cut -d: -f1)
    echo "${indent}Definition: $file:$LINE_NUM"
    
    # Check if async
    if echo "$METHOD_DEF" | grep -q "async\|await"; then
      echo "${indent}Async: true"
    fi
    
    # Extract method calls more accurately
    echo "${indent}Method Calls:"
    
    # Get method body (improved extraction)
    METHOD_END=$(awk -v start=$LINE_NUM 'NR >= start && /^}/ {print NR; exit}' "$file" 2>/dev/null)
    if [ -z "$METHOD_END" ]; then
      METHOD_END=$((LINE_NUM + 50))  # Default to 50 lines if can't find end
    fi
    
    # Extract all method calls with context and execution order
    sed -n "${LINE_NUM},${METHOD_END}p" "$file" 2>/dev/null | grep -n "[a-zA-Z0-9_]\+(" | while read -r call_line; do
      CALL_LINE_NUM=$((LINE_NUM + $(echo "$call_line" | cut -d: -f1) - 1))
      CALL_CONTENT=$(echo "$call_line" | cut -d: -f2-)
      
      # Extract method name from call (exclude comments and strings)
      if ! echo "$CALL_CONTENT" | grep -q "^[[:space:]]*//\|^[[:space:]]*/\*"; then
        CALLED_METHOD=$(echo "$CALL_CONTENT" | grep -o "[a-zA-Z0-9_]*(" | sed 's/($//' | grep -v "if\|for\|while\|function")
        
        if [ -n "$CALLED_METHOD" ] && [ ${#CALLED_METHOD} -gt 2 ]; then
          echo "${indent}  → Calls: $CALLED_METHOD (Execution Line: $CALL_LINE_NUM)"
        
        # Categorize the call
        if echo "$CALLED_METHOD" | grep -qE "find|save|update|delete|query|insert|select|create|get|set"; then
          echo "${indent}    Type: [DB Operation]"
          # Try to extract table/model name
          if echo "$CALL_CONTENT" | grep -q "\."; then
            MODEL=$(echo "$CALL_CONTENT" | grep -o "[a-zA-Z0-9_]*\.$CALLED_METHOD" | cut -d. -f1)
            if [ -n "$MODEL" ]; then
              echo "${indent}    Model/Table: $MODEL"
            fi
          fi
        elif echo "$CALLED_METHOD" | grep -qE "validate|check|verify|assert|ensure"; then
          echo "${indent}    Type: [Validation]"
        elif echo "$CALLED_METHOD" | grep -qE "fetch|axios|request|http|post|get|put|delete"; then
          echo "${indent}    Type: [External API Call]"
          # Try to extract URL
          URL=$(echo "$CALL_CONTENT" | grep -o "['\"][^'\"]*['\"]" | grep -E "http|api|/")
          if [ -n "$URL" ]; then
            echo "${indent}    URL: $URL"
          fi
        elif echo "$CALLED_METHOD" | grep -qE "send|email|notify|publish|emit"; then
          echo "${indent}    Type: [Notification/Event]"
        elif echo "$CALLED_METHOD" | grep -qE "transform|map|reduce|filter|convert|parse|format"; then
          echo "${indent}    Type: [Data Transformation]"
        fi
        
        # Detect async patterns and callbacks
        if echo "$CALL_CONTENT" | grep -q "await\|Promise\|async"; then
          echo "${indent}    Async: true"
        fi
        if echo "$CALL_CONTENT" | grep -qE "then\(|catch\(|finally\("; then
          echo "${indent}    Promise Chain: detected"
        fi
        
        # Check if the called method is defined in the same file
        CALLED_DEF=$(grep -n "function $CALLED_METHOD\|$CALLED_METHOD.*=.*function" "$file" 2>/dev/null | head -1)
        if [ -n "$CALLED_DEF" ]; then
          echo "${indent}    Definition: $file:$(echo "$CALLED_DEF" | cut -d: -f1)"
        else
          # Try to find in imports
          IMPORT=$(grep -n "import.*$CALLED_METHOD\|require.*$CALLED_METHOD" "$file" 2>/dev/null | head -1)
          if [ -n "$IMPORT" ]; then
            echo "${indent}    Imported at: line $(echo "$IMPORT" | cut -d: -f1)"
          fi
        fi
      fi
      fi
    done
    
    # Detect event handlers and callbacks
    echo "${indent}Event Handlers & Callbacks:"
    sed -n "${LINE_NUM},${METHOD_END}p" "$file" 2>/dev/null | grep -n "addEventListener\|on[A-Z]\|emit(\|callback\|cb(" | while read -r event_line; do
      EVENT_LINE_NUM=$((LINE_NUM + $(echo "$event_line" | cut -d: -f1) - 1))
      EVENT_CONTENT=$(echo "$event_line" | cut -d: -f2-)
      if echo "$EVENT_CONTENT" | grep -q "addEventListener"; then
        EVENT_TYPE=$(echo "$EVENT_CONTENT" | grep -o "addEventListener[^'\"]*['\"][^'\"]*" | sed "s/.*['\"]//'")
        echo "${indent}  Event Listener: $EVENT_TYPE (Line: $EVENT_LINE_NUM)"
      elif echo "$EVENT_CONTENT" | grep -q "emit("; then
        EVENT_NAME=$(echo "$EVENT_CONTENT" | grep -o "emit[^'\"]*['\"][^'\"]*" | sed "s/.*['\"]//'")
        echo "${indent}  Event Emitted: $EVENT_NAME (Line: $EVENT_LINE_NUM)"
      elif echo "$EVENT_CONTENT" | grep -qE "callback\|cb("; then
        echo "${indent}  Callback: (Line: $EVENT_LINE_NUM)"
      fi
    done
    
    # Find conditionals and business rules with context
    echo "${indent}Business Rules & Validation:"
    sed -n "${LINE_NUM},${METHOD_END}p" "$file" 2>/dev/null | grep -n "if\s*(" | while read -r cond_line; do
      COND_LINE_NUM=$((LINE_NUM + $(echo "$cond_line" | cut -d: -f1) - 1))
      CONDITION=$(echo "$cond_line" | cut -d: -f2- | sed 's/^[[:space:]]*//')
      echo "${indent}  Rule at line $COND_LINE_NUM:"
      echo "${indent}    Code: $CONDITION"
      
      # Try to infer business rule context
      if echo "$CONDITION" | grep -qE "price\|amount\|cost\|total\|discount\|tax"; then
        echo "${indent}    **Inferred Rule:** Financial calculation or validation"
      elif echo "$CONDITION" | grep -qE "age\|date\|time\|expired\|before\|after"; then
        echo "${indent}    **Inferred Rule:** Time/Date validation"
      elif echo "$CONDITION" | grep -qE "role\|permission\|auth\|admin\|user\.type"; then
        echo "${indent}    **Inferred Rule:** Access control or authorization"
      elif echo "$CONDITION" | grep -qE "email\|phone\|address\|name\|@"; then
        echo "${indent}    **Inferred Rule:** Data format validation"
      elif echo "$CONDITION" | grep -qE "min\|max\|length\|size\|count\|limit"; then
        echo "${indent}    **Inferred Rule:** Boundary or limit check"
      elif echo "$CONDITION" | grep -qE "null\|undefined\|empty\|!"; then
        echo "${indent}    **Inferred Rule:** Existence or required field check"
      fi
    done
    
    # Find error handling
    echo "${indent}Error Handling:"
    ERROR_COUNT=$(sed -n "${LINE_NUM},${METHOD_END}p" "$file" 2>/dev/null | grep -c "catch\|throw\|reject\|\.catch")
    if [ "$ERROR_COUNT" -gt 0 ]; then
      echo "${indent}  Has error handling: Yes ($ERROR_COUNT error handlers)"
    else
      echo "${indent}  Has error handling: No"
    fi
  fi
}

# Find and trace main business operations
echo "--- Discovering Main Business Workflows ---"

# Discover user-related workflows
echo "=== USER WORKFLOWS ==="
USER_METHODS=$(grep -h "createUser\|registerUser\|signup\|login\|authenticate\|updateUser\|deleteUser" $SOURCE_FILES 2>/dev/null | grep -o "[a-zA-Z0-9_]*User[a-zA-Z0-9_]*" | sort -u)
for method in $USER_METHODS; do
  FILE_WITH_METHOD=$(grep -l "function $method\|$method.*=.*function" $SOURCE_FILES 2>/dev/null | head -1)
  if [ -n "$FILE_WITH_METHOD" ]; then
    trace_method_relationships "$method" "$FILE_WITH_METHOD" 0
    echo ""
  fi
done

# Discover order-related workflows
echo "=== ORDER WORKFLOWS ==="
ORDER_METHODS=$(grep -h "createOrder\|processOrder\|checkout\|placeOrder\|fulfillOrder\|cancelOrder" $SOURCE_FILES 2>/dev/null | grep -o "[a-zA-Z0-9_]*Order[a-zA-Z0-9_]*" | sort -u)
for method in $ORDER_METHODS; do
  FILE_WITH_METHOD=$(grep -l "function $method\|$method.*=.*function" $SOURCE_FILES 2>/dev/null | head -1)
  if [ -n "$FILE_WITH_METHOD" ]; then
    trace_method_relationships "$method" "$FILE_WITH_METHOD" 0
    echo ""
  fi
done

# Discover payment-related workflows
echo "=== PAYMENT WORKFLOWS ==="
PAYMENT_METHODS=$(grep -h "processPayment\|chargeCard\|refund\|capture\|authorize" $SOURCE_FILES 2>/dev/null | grep -o "[a-zA-Z0-9_]*Payment[a-zA-Z0-9_]*\|[a-zA-Z0-9_]*pay[a-zA-Z0-9_]*" | sort -u)
for method in $PAYMENT_METHODS; do
  FILE_WITH_METHOD=$(grep -l "function $method\|$method.*=.*function" $SOURCE_FILES 2>/dev/null | head -1)
  if [ -n "$FILE_WITH_METHOD" ]; then
    trace_method_relationships "$method" "$FILE_WITH_METHOD" 0
    echo ""
  fi
done
```

### Step 3: Analyze Data Transformations Throughout Workflows

```bash
echo "=== Data Transformation Analysis ==="

# Find all data access and modification points
echo "--- Data Access & Modification Points ---"
for file in $SOURCE_FILES; do
  if [ -f "$file" ]; then
    # Find data access patterns
    grep -n "req\.body\|req\.params\|req\.query\|request\.get\|request\.post" "$file" 2>/dev/null | while read -r line; do
      LINE_NUM=$(echo "$line" | cut -d: -f1)
      echo "Data Input: $file:$LINE_NUM"
      echo "  Type: [HTTP Request Data]"
      
      # Check for validation nearby
      VALIDATION_CHECK=$(sed -n "$((LINE_NUM-5)),$((LINE_NUM+5))p" "$file" 2>/dev/null | grep -c "validate\|sanitize\|check\|verify")
      if [ "$VALIDATION_CHECK" -gt 0 ]; then
        echo "  Validation: Found"
      else
        echo "  Validation: ⚠️  Not found nearby"
      fi
    done
  fi
done | head -20

# Find data transformation operations with better context
echo "--- Data Transformation Operations ---"
for file in $SOURCE_FILES; do
  if [ -f "$file" ]; then
    # Look for various transformation patterns
    grep -n "\.map(\|\.reduce(\|\.filter(\|transform\|convert\|parse\|serialize\|format\|normalize" "$file" 2>/dev/null | while read -r line; do
      LINE_NUM=$(echo "$line" | cut -d: -f1)
      CONTENT=$(echo "$line" | cut -d: -f2-)
      
      # Skip comments
      if echo "$CONTENT" | grep -q "^[[:space:]]*//\|^[[:space:]]*/\*"; then
        continue
      fi
      
      echo "Transformation: $file:$LINE_NUM"
      
      # Identify transformation type and steps
      if echo "$CONTENT" | grep -q "\.map("; then
        echo "  Type: Array Mapping"
        # Try to identify what's being mapped
        MAPPED_PROP=$(echo "$CONTENT" | grep -o "\.map([^)]*)" | grep -o "[a-zA-Z0-9_]*\." | sed 's/\.$//')
        [ -n "$MAPPED_PROP" ] && echo "  Mapping over: $MAPPED_PROP"
      elif echo "$CONTENT" | grep -q "\.reduce("; then
        echo "  Type: Array Reduction"
        # Check for accumulator pattern
        if echo "$CONTENT" | grep -q "reduce.*acc\|reduce.*sum\|reduce.*total"; then
          echo "  Pattern: Accumulation/Aggregation"
        fi
      elif echo "$CONTENT" | grep -q "\.filter("; then
        echo "  Type: Array Filtering"
        # Try to extract filter condition
        FILTER_COND=$(echo "$CONTENT" | grep -o "filter([^)]*)" | sed 's/filter(//' | sed 's/)$//')
        [ -n "$FILTER_COND" ] && echo "  Condition: $FILTER_COND"
      elif echo "$CONTENT" | grep -q "parse"; then
        echo "  Type: Data Parsing"
        if echo "$CONTENT" | grep -q "JSON\.parse"; then
          echo "  Subtype: JSON Parsing"
        elif echo "$CONTENT" | grep -q "parseInt\|parseFloat"; then
          echo "  Subtype: Number Parsing"
        fi
      elif echo "$CONTENT" | grep -q "serialize\|stringify"; then
        echo "  Type: Serialization"
        if echo "$CONTENT" | grep -q "JSON\.stringify"; then
          echo "  Subtype: JSON Serialization"
        fi
      elif echo "$CONTENT" | grep -q "format"; then
        echo "  Type: Data Formatting"
      fi
      
      # Show the actual transformation
      echo "  Code: $(echo "$CONTENT" | sed 's/^[[:space:]]*//' | head -c 80)..."
      
      # Look for chained transformations
      if echo "$CONTENT" | grep -qE "\.map.*\.filter\|\.filter.*\.map\|\.map.*\.reduce"; then
        echo "  Chain: Multiple transformations detected"
      fi
      
      # Check if result is validated
      NEXT_LINES=$(sed -n "$((LINE_NUM+1)),$((LINE_NUM+5))p" "$file" 2>/dev/null)
      if echo "$NEXT_LINES" | grep -q "validate\|check\|assert\|if.*null\|if.*undefined"; then
        echo "  Post-validation: Yes"
      else
        echo "  Post-validation: No"
      fi
      
      # Check for error handling
      if echo "$NEXT_LINES" | grep -q "try\|catch\|\.catch"; then
        echo "  Error Handling: Yes"
      fi
      echo ""
    done
  fi
done | head -30

# Analyze data flow between layers
echo "--- Layer-to-Layer Data Flow ---"
for file in $SOURCE_FILES; do
  if [ -f "$file" ]; then
    # Find DTO/Model/Entity conversions
    grep -n "toDTO\|toModel\|toEntity\|toResponse\|toRequest\|fromDTO\|fromModel" "$file" 2>/dev/null | while read -r line; do
      LINE_NUM=$(echo "$line" | cut -d: -f1)
      CONTENT=$(echo "$line" | cut -d: -f2-)
      
      echo "Layer Conversion: $file:$LINE_NUM"
      
      # Identify conversion direction
      if echo "$CONTENT" | grep -q "toDTO\|toResponse"; then
        echo "  Direction: Model → DTO/Response"
      elif echo "$CONTENT" | grep -q "toModel\|toEntity"; then
        echo "  Direction: DTO/Request → Model"
      elif echo "$CONTENT" | grep -q "fromDTO"; then
        echo "  Direction: DTO → Model"
      fi
      
      # Look for field mapping
      METHOD_START=$LINE_NUM
      METHOD_END=$((LINE_NUM + 20))
      echo "  Field Mappings:"
      sed -n "${METHOD_START},${METHOD_END}p" "$file" 2>/dev/null | grep -E ":\s*[a-zA-Z]|=.*\." | head -5 | sed 's/^/    /'
    done
  fi
done | head -20

# Find data validation points
echo "--- Data Validation Points ---"
for file in $SOURCE_FILES; do
  if [ -f "$file" ]; then
    grep -n "validate\|joi\|yup\|schema\|validator\|assert" "$file" 2>/dev/null | grep -v "//" | while read -r line; do
      LINE_NUM=$(echo "$line" | cut -d: -f1)
      CONTENT=$(echo "$line" | cut -d: -f2-)
      
      echo "Validation: $file:$LINE_NUM"
      
      # Identify validation type
      if echo "$CONTENT" | grep -q "joi\|yup"; then
        echo "  Library: Schema validation (Joi/Yup)"
      elif echo "$CONTENT" | grep -q "validator\|Validator"; then
        echo "  Library: Validator library"
      elif echo "$CONTENT" | grep -q "assert"; then
        echo "  Type: Assertion"
      else
        echo "  Type: Custom validation"
      fi
      
      # Show validation code
      echo "  Code: $(echo "$CONTENT" | sed 's/^[[:space:]]*//' | head -c 80)..."
    done
  fi
done | head -20
```

### Step 4: Map Business Rules and Decision Points

```bash
echo "=== Business Rule Implementation Analysis ==="

# Find all conditional business logic with context
echo "--- Business Decision Points ---"
for file in $SOURCE_FILES; do
  if [ -f "$file" ]; then
    # Find conditionals with business logic (not just null checks)
    grep -n "if\s*(" "$file" 2>/dev/null | while read -r line; do
      LINE_NUM=$(echo "$line" | cut -d: -f1)
      CONDITION=$(echo "$line" | cut -d: -f2-)
      
      # Skip simple null/undefined checks
      if echo "$CONDITION" | grep -qE "&&|\|\||>=|<=|>|<|==|!=|\.includes|\.contains|\.match"; then
        echo "Decision Point: $file:$LINE_NUM"
        echo "  Condition: $(echo "$CONDITION" | sed 's/^[[:space:]]*//' | head -c 100)..."
        
        # Check what happens in each branch
        THEN_BLOCK=$(sed -n "$((LINE_NUM+1)),$((LINE_NUM+5))p" "$file" 2>/dev/null | grep -v "^[[:space:]]*$")
        echo "  Then: $(echo "$THEN_BLOCK" | head -1 | sed 's/^[[:space:]]*//')"
        
        # Look for else block
        ELSE_LINE=$(sed -n "$((LINE_NUM+1)),$((LINE_NUM+10))p" "$file" 2>/dev/null | grep -n "else" | head -1 | cut -d: -f1)
        if [ -n "$ELSE_LINE" ]; then
          echo "  Has else branch: Yes"
        fi
        echo ""
      fi
    done
  fi
done | head -30

# Find business rule validations with better context
echo "--- Business Rule Validations ---"
for file in $SOURCE_FILES; do
  if [ -f "$file" ]; then
    # Look for validation errors with business context
    grep -n "throw\|reject\|Error\|\.status(4" "$file" 2>/dev/null | while read -r line; do
      LINE_NUM=$(echo "$line" | cut -d: -f1)
      ERROR_LINE=$(echo "$line" | cut -d: -f2-)
      
      # Get context to understand the business rule
      CONTEXT=$(sed -n "$((LINE_NUM-5)),$((LINE_NUM-1))p" "$file" 2>/dev/null)
      
      # Check if this is a business rule (not technical error)
      if echo "$CONTEXT" | grep -qE "business\|policy\|rule\|validate\|check\|verify\|ensure\|must\|should\|cannot\|forbidden"; then
        echo "Business Rule: $file:$LINE_NUM"
        echo "  Error: $(echo "$ERROR_LINE" | sed 's/^[[:space:]]*//' | head -c 80)..."
        
        # Extract the condition that triggered this
        CONDITION=$(echo "$CONTEXT" | grep -E "if.*{" | tail -1)
        if [ -n "$CONDITION" ]; then
          echo "  Rule: $(echo "$CONDITION" | sed 's/^[[:space:]]*//' | head -c 80)..."
        fi
        echo ""
      fi
    done
  fi
done | head -20

# Find state machines or status transitions
echo "--- State Transitions ---"
for file in $SOURCE_FILES; do
  if [ -f "$file" ]; then
    # Find status changes
    grep -n "status.*=\|state.*=\|transition\|workflow" "$file" 2>/dev/null | grep -v "console.log\|//" | while read -r line; do
      LINE_NUM=$(echo "$line" | cut -d: -f1)
      CONTENT=$(echo "$line" | cut -d: -f2-)
      
      echo "State Change: $file:$LINE_NUM"
      echo "  Code: $(echo "$CONTENT" | sed 's/^[[:space:]]*//' | head -c 80)..."
      
      # Try to find valid transitions
      CONTEXT=$(sed -n "$((LINE_NUM-10)),$((LINE_NUM+10))p" "$file" 2>/dev/null)
      if echo "$CONTEXT" | grep -q "switch\|case"; then
        echo "  Type: State machine (switch/case)"
        # Extract cases
        echo "  States found:"
        echo "$CONTEXT" | grep "case" | head -5 | sed 's/^/    /'
      elif echo "$CONTEXT" | grep -qE "from.*to|oldStatus|newStatus|previousState|nextState"; then
        echo "  Type: Direct transition"
      fi
      echo ""
    done
  fi
done | head -20

# Find business calculations and formulas
echo "--- Business Calculations ---"
for file in $SOURCE_FILES; do
  if [ -f "$file" ]; then
    # Find calculations (assignments with math operations)
    grep -n "=.*[+\-\*/]" "$file" 2>/dev/null | grep -v "+=\|-=\|++\|--\|console.log" | while read -r line; do
      LINE_NUM=$(echo "$line" | cut -d: -f1)
      CALC=$(echo "$line" | cut -d: -f2-)
      
      # Check if it's a business calculation (not array index or simple increment)
      if echo "$CALC" | grep -qE "price\|cost\|total\|amount\|fee\|tax\|discount\|rate\|percentage\|score\|weight"; then
        echo "Business Calculation: $file:$LINE_NUM"
        echo "  Formula: $(echo "$CALC" | sed 's/^[[:space:]]*//' | head -c 100)..."
        
        # Check if result is validated
        NEXT_LINES=$(sed -n "$((LINE_NUM+1)),$((LINE_NUM+3))p" "$file" 2>/dev/null)
        if echo "$NEXT_LINES" | grep -q "if.*<\|if.*>"; then
          echo "  Validation: Yes"
        else
          echo "  Validation: No"
        fi
        echo ""
      fi
    done
  fi
done | head -20
```

### Step 5: Trace Complete Request Lifecycle

```bash
echo "=== Complete Request Lifecycle Tracing ==="

# Enhanced function to trace complete request flow
trace_complete_flow() {
  local endpoint=$1
  local method=$2
  local file=$3
  local line_num=$4
  
  echo "=== COMPLETE FLOW TRACE: $method $endpoint ==="
  echo "Entry Point: $file:$line_num"
  echo ""
  
  # 1. Find middleware chain
  echo "1. MIDDLEWARE CHAIN:"
  # Look for middleware before this route
  MIDDLEWARE=$(sed -n "1,${line_num}p" "$file" 2>/dev/null | grep -B10 "$endpoint" | grep -E "\.use\(|middleware" | tail -5)
  if [ -n "$MIDDLEWARE" ]; then
    echo "$MIDDLEWARE" | sed 's/^/   /'
  else
    echo "   No middleware found"
  fi
  echo ""
  
  # 2. Extract handler function and find its implementation
  echo "2. HANDLER FUNCTION:"
  HANDLER_LINE=$(sed -n "${line_num}p" "$file" 2>/dev/null)
  HANDLER=$(echo "$HANDLER_LINE" | sed -E 's/.*[,\s]+([a-zA-Z0-9_]+)[\s\)].*/\1/' | grep -v "function\|async\|router")
  if [ -n "$HANDLER" ] && [ "$HANDLER" != "$HANDLER_LINE" ]; then
    echo "   Handler: $HANDLER"
    # Find handler implementation
    HANDLER_IMPL=$(grep -n "function $HANDLER\|const $HANDLER\|$HANDLER.*=" "$file" 2>/dev/null | head -1)
    if [ -n "$HANDLER_IMPL" ]; then
      HANDLER_LINE_NUM=$(echo "$HANDLER_IMPL" | cut -d: -f1)
      echo "   Implementation: $file:$HANDLER_LINE_NUM"
      
      # Analyze handler body
      echo ""
      echo "3. REQUEST PROCESSING:"
      # Extract validation
      sed -n "${HANDLER_LINE_NUM},$((HANDLER_LINE_NUM+30))p" "$file" 2>/dev/null | grep -n "validate\|check\|verify\|assert" | head -5 | while read -r val_line; do
        VAL_LINE_NUM=$((HANDLER_LINE_NUM + $(echo "$val_line" | cut -d: -f1) - 1))
        echo "   Validation at line $VAL_LINE_NUM: $(echo "$val_line" | cut -d: -f2- | sed 's/^[[:space:]]*//' | head -c 60)..."
      done
      
      echo ""
      echo "4. SERVICE LAYER CALLS:"
      # Find service calls
      sed -n "${HANDLER_LINE_NUM},$((HANDLER_LINE_NUM+50))p" "$file" 2>/dev/null | grep -n "[Ss]ervice\.\|await.*\." | head -5 | while read -r svc_line; do
        SVC_LINE_NUM=$((HANDLER_LINE_NUM + $(echo "$svc_line" | cut -d: -f1) - 1))
        echo "   Service call at line $SVC_LINE_NUM: $(echo "$svc_line" | cut -d: -f2- | sed 's/^[[:space:]]*//' | head -c 60)..."
      done
      
      echo ""
      echo "5. DATABASE OPERATIONS:"
      # Find DB operations
      sed -n "${HANDLER_LINE_NUM},$((HANDLER_LINE_NUM+50))p" "$file" 2>/dev/null | grep -n "find\|save\|update\|delete\|query\|insert\|select" | grep -v "console\|log" | head -5 | while read -r db_line; do
        DB_LINE_NUM=$((HANDLER_LINE_NUM + $(echo "$db_line" | cut -d: -f1) - 1))
        echo "   DB operation at line $DB_LINE_NUM: $(echo "$db_line" | cut -d: -f2- | sed 's/^[[:space:]]*//' | head -c 60)..."
      done
      
      echo ""
      echo "6. EXTERNAL API CALLS:"
      # Find external calls
      sed -n "${HANDLER_LINE_NUM},$((HANDLER_LINE_NUM+50))p" "$file" 2>/dev/null | grep -n "fetch\|axios\|http\|request" | head -5 | while read -r api_line; do
        API_LINE_NUM=$((HANDLER_LINE_NUM + $(echo "$api_line" | cut -d: -f1) - 1))
        echo "   API call at line $API_LINE_NUM: $(echo "$api_line" | cut -d: -f2- | sed 's/^[[:space:]]*//' | head -c 60)..."
      done
      
      echo ""
      echo "7. RESPONSE HANDLING:"
      # Find response
      sed -n "${HANDLER_LINE_NUM},$((HANDLER_LINE_NUM+50))p" "$file" 2>/dev/null | grep -n "res\.\|response\.\|return" | head -5 | while read -r res_line; do
        RES_LINE_NUM=$((HANDLER_LINE_NUM + $(echo "$res_line" | cut -d: -f1) - 1))
        echo "   Response at line $RES_LINE_NUM: $(echo "$res_line" | cut -d: -f2- | sed 's/^[[:space:]]*//' | head -c 60)..."
      done
      
      echo ""
      echo "8. ERROR HANDLING:"
      # Check error handling
      ERROR_HANDLING=$(sed -n "${HANDLER_LINE_NUM},$((HANDLER_LINE_NUM+50))p" "$file" 2>/dev/null | grep -c "catch\|\.catch\|error")
      if [ "$ERROR_HANDLING" -gt 0 ]; then
        echo "   Error handling found: Yes ($ERROR_HANDLING instances)"
        sed -n "${HANDLER_LINE_NUM},$((HANDLER_LINE_NUM+50))p" "$file" 2>/dev/null | grep -n "catch\|\.catch" | head -3 | while read -r err_line; do
          ERR_LINE_NUM=$((HANDLER_LINE_NUM + $(echo "$err_line" | cut -d: -f1) - 1))
          echo "   Error handler at line $ERR_LINE_NUM"
        done
      else
        echo "   Error handling found: No"
      fi
    fi
  fi
  echo ""
  echo "---"
  echo ""
}

# Find and trace major endpoints
echo "--- Tracing Major Endpoints ---"
for file in $SOURCE_FILES; do
  if [ -f "$file" ]; then
    # Find all HTTP endpoints
    grep -n "router\.\(get\|post\|put\|patch\|delete\)\|app\.\(get\|post\|put\|patch\|delete\)" "$file" 2>/dev/null | while read -r line; do
      LINE_NUM=$(echo "$line" | cut -d: -f1)
      CONTENT=$(echo "$line" | cut -d: -f2-)
      
      # Extract method
      METHOD=$(echo "$CONTENT" | grep -o "\.\(get\|post\|put\|patch\|delete\)" | sed 's/\.//' | tr '[:lower:]' '[:upper:]' | head -1)
      
      # Extract endpoint
      ENDPOINT=$(echo "$CONTENT" | grep -o "['\"][^'\"]*['\"]" | head -1 | tr -d "'\"")
      
      if [ -n "$ENDPOINT" ] && [ -n "$METHOD" ]; then
        # Skip static file routes
        if ! echo "$ENDPOINT" | grep -q "\.js\|\.css\|\.html\|static"; then
          trace_complete_flow "$ENDPOINT" "$METHOD" "$file" "$LINE_NUM"
        fi
      fi
    done | head -100  # Limit output to first few endpoints
  fi
done

# Identify asynchronous operations and their handling
echo "=== Asynchronous Operation Analysis ==="
for file in $SOURCE_FILES; do
  if [ -f "$file" ]; then
    echo "File: $file"
    echo "Async Operations:"
    
    # Find async/await patterns
    grep -n "async\|await" "$file" 2>/dev/null | head -10 | while read -r async_line; do
      LINE_NUM=$(echo "$async_line" | cut -d: -f1)
      CONTENT=$(echo "$async_line" | cut -d: -f2-)
      echo "  Line $LINE_NUM: $(echo "$CONTENT" | sed 's/^[[:space:]]*//' | head -c 80)..."
      
      # Check if properly wrapped in try-catch
      CONTEXT=$(sed -n "$((LINE_NUM-3)),$((LINE_NUM+3))p" "$file" 2>/dev/null)
      if echo "$CONTEXT" | grep -q "try\|catch"; then
        echo "    Error handling: Yes"
      else
        echo "    Error handling: ⚠️  No try-catch found"
      fi
    done
    echo ""
  fi
done | head -50

# Identify external API calls with URLs
echo "=== External API Integration Analysis ==="
for file in $SOURCE_FILES; do
  if [ -f "$file" ]; then
    # Find fetch/axios/http calls with URLs
    grep -n "fetch\|axios\|http\|request" "$file" 2>/dev/null | grep -v "//" | while read -r line; do
      LINE_NUM=$(echo "$line" | cut -d: -f1)
      CONTENT=$(echo "$line" | cut -d: -f2-)
      
      # Look for URLs in the same line or nearby
      if echo "$CONTENT" | grep -qE "http://|https://|api\.|/api/"; then
        echo "External API Call: $file:$LINE_NUM"
        echo "  Code: $(echo "$CONTENT" | sed 's/^[[:space:]]*//' | head -c 100)..."
        
        # Try to extract URL
        URL=$(echo "$CONTENT" | grep -o "['\"][^'\"]*['\"]" | grep -E "http|api" | head -1)
        if [ -n "$URL" ]; then
          echo "  URL: $URL"
        fi
        
        # Check for authentication
        AUTH_CONTEXT=$(sed -n "$((LINE_NUM-5)),$((LINE_NUM+5))p" "$file" 2>/dev/null)
        if echo "$AUTH_CONTEXT" | grep -qE "Authorization|Bearer|apiKey|api_key|token"; then
          echo "  Authentication: Yes"
        else
          echo "  Authentication: Not found"
        fi
        
        # Check for retry logic
        if echo "$AUTH_CONTEXT" | grep -q "retry\|attempt\|fallback"; then
          echo "  Retry logic: Yes"
        else
          echo "  Retry logic: No"
        fi
        echo ""
      fi
    done
  fi
done | head -20
```

## 2. Validate Previous Findings

### Step 6: Load and Verify Components from Prior Analysis

```bash
# FIRST: Verify previous analyses exist and are valid
echo "=== Loading verified components from previous prompts ==="

# Check for required previous analyses
for i in {1..5}; do
  if [ -f "docs/code-review/${i}-*.md" ]; then
    echo "✓ Found analysis from prompt #$i"
  else
    echo "✗ MISSING: Analysis from prompt #$i - cannot proceed with accurate business analysis"
  fi
done

# Extract verified components for business analysis
echo "=== Components to analyze for business logic ==="
if [ -f "docs/code-review/2-ARCHITECTURE_ANALYSIS.md" ]; then
  grep -E "✓ COMPONENT:|Path:|Evidence:" docs/code-review/2-ARCHITECTURE_ANALYSIS.md
fi

# Get API endpoints for completeness check
echo "=== API endpoints to check for CRUD completeness ==="
if [ -f "docs/code-review/3-API_CONTRACT_ANALYSIS.md" ]; then
  grep -E "Endpoint:.*\[|Method|Path" docs/code-review/3-API_CONTRACT_ANALYSIS.md
fi
```

## 2. Discover Actual Performance Issues

### Step 2: Find Real Performance Anti-patterns with Evidence

```bash
echo "=== Searching for actual performance issues ==="

# First, get list of actual source files to analyze
SOURCE_FILES=$(find . -name "*.js" -o -name "*.ts" -o -name "*.go" -o -name "*.py" | grep -v node_modules | head -50)

# Detect actual N+1 query problems with file:line
echo "--- N+1 Query Patterns ---"
for file in $SOURCE_FILES; do
  if [ -f "$file" ]; then
    # Look for loops containing async database calls
    grep -n -B2 -A2 "forEach\|map\|for" "$file" 2>/dev/null | \
      grep -B2 -A2 "await.*find\|await.*query\|await.*get" | \
      grep -B4 -A4 "forEach\|map" | head -10
  fi
done

# Find actual nested loops (O(n²) or worse)
echo "--- Nested Loop Patterns ---"
for file in $SOURCE_FILES; do
  if [ -f "$file" ]; then
    # Detect nested iterations
    awk '/for.*{/ {indent++} /}/ {indent--} {if(indent>=2) print FILENAME":"NR":"$0}' "$file" 2>/dev/null | head -5
  fi
done

# Check for actual synchronous blocking operations
echo "--- Synchronous Operations ---"
grep -n "readFileSync\|execSync\|sleep\|time\.Sleep" $SOURCE_FILES 2>/dev/null | head -10

# Find actual unbounded data operations
echo "--- Unbounded Data Queries ---"
grep -n "SELECT \*\|findAll()\|getAll()" $SOURCE_FILES 2>/dev/null | \
  grep -v "LIMIT\|limit\|take" | head -10
```

### Step 3: Analyze Resource Usage Patterns

```bash
# Check for actual missing pagination
echo "=== Pagination Analysis ==="

# Find list endpoints without pagination
API_LIST_FILES=$(grep -l "router.*get.*s'\|app.*get.*s'" $SOURCE_FILES 2>/dev/null)
for file in $API_LIST_FILES; do
  echo "Checking pagination in: $file"
  HAS_PAGINATION=$(grep -n "limit\|LIMIT\|page\|offset\|cursor" "$file" 2>/dev/null | wc -l)
  if [ "$HAS_PAGINATION" -eq 0 ]; then
    echo "  ⚠️  NO PAGINATION FOUND in $file"
    grep -n "findAll\|find()\|SELECT" "$file" 2>/dev/null | head -3
  fi
done

# Find actual memory leak patterns
echo "--- Potential Memory Leaks ---"
grep -n "setTimeout\|setInterval" $SOURCE_FILES 2>/dev/null | \
  while read line; do
    FILE=$(echo "$line" | cut -d: -f1)
    LINE_NUM=$(echo "$line" | cut -d: -f2)
    # Check if there's a corresponding clear in the same file
    if ! grep -q "clearTimeout\|clearInterval" "$FILE" 2>/dev/null; then
      echo "⚠️  Potential leak: $line"
    fi
  done | head -10
```

## 3. Analyze Code Quality Issues

### Step 4: Detect Actual Code Duplication

```bash
echo "=== Code Quality Analysis ==="

# Find actual duplicate function implementations
echo "--- Checking for duplicate functions ---"
# Extract function signatures and check for duplicates
for file in $SOURCE_FILES; do
  if [ -f "$file" ]; then
    grep -n "function\|const.*=.*=>" "$file" 2>/dev/null | \
      sed 's/.*function \([a-zA-Z0-9_]*\).*/\1/' | \
      sed 's/.*const \([a-zA-Z0-9_]*\).*/\1/'
  fi
done | sort | uniq -c | sort -rn | awk '$1 > 1' | head -10

# Check for actual validation duplication
echo "--- Validation Pattern Duplication ---"
VALIDATION_FILES=$(grep -l "validate\|valid" $SOURCE_FILES 2>/dev/null)
for pattern in "email" "password" "phone" "date"; do
  COUNT=$(grep -n "validate.*$pattern\|$pattern.*validation" $VALIDATION_FILES 2>/dev/null | wc -l)
  if [ "$COUNT" -gt 1 ]; then
    echo "Found $COUNT instances of $pattern validation:"
    grep -n "validate.*$pattern\|$pattern.*validation" $VALIDATION_FILES 2>/dev/null | head -3
  fi
done

# Find similar code blocks (using line similarity)
echo "--- Similar Code Blocks ---"
for file in $(echo $SOURCE_FILES | head -10); do
  if [ -f "$file" ]; then
    # Extract code blocks and check for similarity
    awk '/^[[:space:]]*{/ {p=1} p {print FILENAME":"NR":"$0} /^[[:space:]]*}/ {p=0}' "$file" 2>/dev/null
  fi
done | sort | uniq -c | sort -rn | awk '$1 > 1' | head -10
```

### Step 5: Analyze Technical Debt

```bash
echo "=== Technical Debt Analysis ==="

# Find actual TODO/FIXME comments with context
echo "--- Technical Debt Markers ---"
grep -n "TODO\|FIXME\|HACK\|XXX\|TECHNICAL DEBT" $SOURCE_FILES 2>/dev/null | \
  while read -r line; do
    echo "$line"
    # Show the next 2 lines for context
    FILE=$(echo "$line" | cut -d: -f1)
    LINE_NUM=$(echo "$line" | cut -d: -f2)
    tail -n +$((LINE_NUM + 1)) "$FILE" 2>/dev/null | head -2 | sed 's/^/    /'
    echo ""
  done | head -20

# Identify actual large files (potential god objects)
echo "--- Large Files Analysis ---"
for file in $SOURCE_FILES; do
  if [ -f "$file" ]; then
    LINES=$(wc -l < "$file")
    if [ "$LINES" -gt 300 ]; then
      echo "⚠️  Large file: $file ($LINES lines)"
      # Check complexity indicators
      FUNCTIONS=$(grep -c "function\|=>" "$file" 2>/dev/null)
      CLASSES=$(grep -c "class " "$file" 2>/dev/null)
      echo "    Functions: $FUNCTIONS, Classes: $CLASSES"
    fi
  fi
done

# Find actual missing error handling
echo "--- Missing Error Handling ---"
for file in $SOURCE_FILES; do
  if [ -f "$file" ]; then
    # Find try blocks without proper catch handling
    grep -n -A5 "catch.*{" "$file" 2>/dev/null | \
      grep -B5 -A5 "catch.*{\s*}" | head -10
  fi
done
```

## 4. Identify Business Logic Gaps

### Step 6: Analyze CRUD Operation Completeness

```bash
echo "=== Business Logic Analysis ==="

# Using API endpoints from prompt #3 analysis
echo "--- CRUD Operation Completeness Check ---"

# First, extract actual endpoints from previous analysis
if [ -f "docs/code-review/3-API_CONTRACT_ANALYSIS.md" ]; then
  echo "Using verified endpoints from API analysis:"
  grep -E "Method|Endpoint:" docs/code-review/3-API_CONTRACT_ANALYSIS.md
else
  echo "⚠️  No API analysis found - searching for endpoints directly"
  grep -n "router\.\|app\." $SOURCE_FILES 2>/dev/null | \
    grep -E "(get|post|put|patch|delete)" | head -20
fi

# For each resource type found, check CRUD completeness
echo "--- Resource CRUD Analysis ---"
RESOURCES=$(grep -oE "/(api/)?v?[0-9]*/([a-zA-Z]+)" $SOURCE_FILES 2>/dev/null | \
  sed 's/.*\///g' | sort -u | grep -v "^v[0-9]" | head -10)

for resource in $RESOURCES; do
  echo "Resource: $resource"
  CREATE=$(grep -n "POST.*$resource" $SOURCE_FILES 2>/dev/null | wc -l)
  READ=$(grep -n "GET.*$resource" $SOURCE_FILES 2>/dev/null | wc -l)
  UPDATE=$(grep -n "PUT\|PATCH.*$resource" $SOURCE_FILES 2>/dev/null | wc -l)
  DELETE=$(grep -n "DELETE.*$resource" $SOURCE_FILES 2>/dev/null | wc -l)
  
  echo "  CREATE (POST): $([ $CREATE -gt 0 ] && echo '✓' || echo '❌') Found: $CREATE"
  echo "  READ (GET): $([ $READ -gt 0 ] && echo '✓' || echo '❌') Found: $READ"
  echo "  UPDATE (PUT/PATCH): $([ $UPDATE -gt 0 ] && echo '✓' || echo '❌') Found: $UPDATE"
  echo "  DELETE: $([ $DELETE -gt 0 ] && echo '✓' || echo '❌') Found: $DELETE"
  echo ""
done

# Check for actual bulk operations
echo "--- Bulk Operations Analysis ---"
BULK_OPS=$(grep -n "bulk\|batch\|multiple" $SOURCE_FILES 2>/dev/null | \
  grep -i "create\|update\|delete\|insert" | head -10)
if [ -z "$BULK_OPS" ]; then
  echo "❌ NO BULK OPERATIONS FOUND"
else
  echo "$BULK_OPS"
fi
```

### Step 7: Analyze User Experience Patterns

```bash
echo "=== User Experience Analysis ==="

# Find actual loading state implementations
echo "--- Loading State Implementation ---"
UI_FILES=$(find . -name "*.jsx" -o -name "*.tsx" -o -name "*.vue" -o -name "*.js" | grep -v node_modules | head -30)
if [ -n "$UI_FILES" ]; then
  LOADING_COUNT=$(grep -n "loading\|isLoading\|spinner\|Spinner" $UI_FILES 2>/dev/null | wc -l)
  ASYNC_COUNT=$(grep -n "async\|await\|fetch\|axios" $UI_FILES 2>/dev/null | wc -l)
  
  echo "Async operations: $ASYNC_COUNT"
  echo "Loading indicators: $LOADING_COUNT"
  
  if [ "$LOADING_COUNT" -lt "$((ASYNC_COUNT / 2))" ]; then
    echo "⚠️  MISSING LOADING STATES: Only $LOADING_COUNT loading indicators for $ASYNC_COUNT async operations"
    
    # Show async operations without loading states
    echo "--- Async operations potentially missing loading states ---"
    for file in $UI_FILES; do
      if [ -f "$file" ]; then
        ASYNC_IN_FILE=$(grep -n "async\|await" "$file" 2>/dev/null | wc -l)
        LOADING_IN_FILE=$(grep -n "loading\|isLoading" "$file" 2>/dev/null | wc -l)
        if [ "$ASYNC_IN_FILE" -gt "$LOADING_IN_FILE" ]; then
          echo "  ⚠️  $file: $ASYNC_IN_FILE async ops, only $LOADING_IN_FILE loading states"
        fi
      fi
    done | head -10
  fi
fi

# Check actual error handling coverage
echo "--- Error Handling Coverage ---"
ERROR_HANDLING=$(grep -n "catch\|error\|Error" $SOURCE_FILES 2>/dev/null | wc -l)
TRY_BLOCKS=$(grep -n "try\s*{" $SOURCE_FILES 2>/dev/null | wc -l)
ASYNC_CALLS=$(grep -n "await\|\.then" $SOURCE_FILES 2>/dev/null | wc -l)

echo "Try blocks: $TRY_BLOCKS"
echo "Async calls: $ASYNC_CALLS"
echo "Error handling: $ERROR_HANDLING"

if [ "$TRY_BLOCKS" -lt "$((ASYNC_CALLS / 3))" ]; then
  echo "⚠️  INSUFFICIENT ERROR HANDLING: Only $TRY_BLOCKS try blocks for $ASYNC_CALLS async operations"
fi

# Analyze external API reliability
echo "--- External API Reliability Analysis ---"
for file in $SOURCE_FILES; do
  if grep -q "axios\|fetch\|http\|request" "$file" 2>/dev/null; then
    echo "File: $file"
    # Check for timeout configurations
    TIMEOUT=$(grep -n "timeout:" "$file" 2>/dev/null)
    if [ -n "$TIMEOUT" ]; then
      echo "  ✓ Timeout configured: $TIMEOUT"
    else
      echo "  ⚠️  No timeout configuration found"
    fi
    
    # Check for retry logic
    RETRY=$(grep -n "retry\|maxAttempts\|backoff" "$file" 2>/dev/null)
    if [ -n "$RETRY" ]; then
      echo "  ✓ Retry logic found"
    else
      echo "  ⚠️  No retry logic found"
    fi
    
    # Check for circuit breaker
    CIRCUIT=$(grep -n "circuit\|breaker\|failureThreshold" "$file" 2>/dev/null)
    if [ -n "$CIRCUIT" ]; then
      echo "  ✓ Circuit breaker pattern found"
    else
      echo "  ⚠️  No circuit breaker pattern"
    fi
    
    # Check for fallback mechanism
    FALLBACK=$(grep -n "fallback\|default.*response\|catch.*return" "$file" 2>/dev/null)
    if [ -n "$FALLBACK" ]; then
      echo "  ✓ Fallback mechanism found"
    else
      echo "  ⚠️  No fallback mechanism"
    fi
    echo ""
  fi
done | head -20

# Find actual retry mechanisms with configuration
echo "--- Retry Configuration Details ---"
RETRY_PATTERNS=$(grep -n "retry\|Retry\|fallback\|attempt\|backoff" $SOURCE_FILES 2>/dev/null | \
  grep -v "//\|/\*" | head -10)
if [ -z "$RETRY_PATTERNS" ]; then
  echo "❌ NO RETRY LOGIC FOUND"
else
  echo "Found retry patterns:"
  echo "$RETRY_PATTERNS"
  
  # Extract retry configurations
  for file in $(echo "$RETRY_PATTERNS" | cut -d: -f1 | sort -u | head -3); do
    echo ""
    echo "Retry config in $file:"
    grep -A3 -B3 "maxRetries\|retryDelay\|backoffMultiplier" "$file" 2>/dev/null | head -10
  done
fi
```

## 5. Generate Evidence-Based Improvement Analysis

### CRITICAL: Document Only Discovered Issues

Create `docs/code-review/6-BUSINESS_ANALYSIS.md` with ONLY verified findings:

````markdown
# Business Improvement Analysis - VERIFIED FINDINGS ONLY

## Discovery Summary

**Analysis Date**: [Current date]
**Files Analyzed**: [Actual count from $SOURCE_FILES]
**Workflows Traced**: [Count of complete workflows analyzed]
**Entry Points Discovered**: [Count from Step 1]
**Data Transformations**: [Count from Step 3]
**Business Rules Identified**: [Count from Step 4]
**Performance Issues Found**: [Count from steps 2-3]
**Business Logic Gaps**: [Count from steps 6-7]
**Code Quality Issues**: [Count from steps 4-5]

## Executive Summary

**Health Score**: [Calculate based on actual findings]
- Workflow Completeness: [X]% of operations fully traced
- Business Logic Coverage: [X]% of rules properly implemented
- Data Validation Coverage: [X]% of transformations validated
- Performance Issues: [Count] critical, [Count] high
- Missing CRUD Operations: [Count] resources incomplete
- Code Duplication: [Count] instances found
- Technical Debt: [Count] TODO/FIXME markers

## Complete Workflow Analysis

### Indirect Dependencies & Dynamic Calls

[From Step 1.5 findings]

#### Event-Driven Architecture
**Events Found**: [Count]
- Event: `[event name]` 
  - Emitter: `[file:line]`
  - Listeners: `[file:line]`, `[file:line]`
  - ⚠️  Orphaned events (no listeners): [List]

#### Dependency Injection
**DI Patterns Found**: [Count]
- `[file:line]`: [Service] injected into [Component]
- Dynamic resolution: [Any runtime dependency resolution]

#### Dynamic Function Calls
**Dynamic Calls Found**: [Count]
- `[file:line]`: Dynamic method invocation
- **LLM Manual Trace Required**: [List locations needing manual analysis]

### Traced Business Workflows

[Document ONLY workflows actually traced in Step 2]

#### User Creation Workflow
**Entry Point**: `[file:line]` - POST /api/users
**Complete Flow**:
1. **Request Entry**: `[file:line]`
   - Handler: createUser
   - Middleware: [List actual middleware found]
   
2. **Validation Layer**: `[file:line]`
   - Method: validateUserInput
   - Rules checked: [List actual validations found]
   - Missing validations: [List gaps found]
   
3. **Business Logic**: `[file:line]`
   - Method: processUserCreation
   - Data transformations:
     - `[file:line]`: [Describe transformation]
     - `[file:line]`: [Describe transformation]
   - Business rules applied:
     - `[file:line]`: **Inferred Rule:** [LLM's interpretation of the rule]
       - **Code Evidence:** `[actual code snippet from that line]`
       - **Rule Type:** [validation/calculation/authorization/business constraint]
   
4. **Database Operations**: 
   - `[file:line]`: checkUserExists()
   - `[file:line]`: createUser()
   - `[file:line]`: createUserProfile()
   - Transaction boundary: [Found/Not Found at file:line]
   
5. **External Service Calls**:
   - `[file:line]`: sendWelcomeEmail()
     - Timeout: [Configured/Not configured]
     - Retry: [Yes with X attempts/No]
     - Fallback: [Graceful degradation/Hard failure]
   - `[file:line]`: notifyAdmins()
     - Error handling: [Try-catch/Promise catch/Unhandled]
     - Circuit breaker: [Implemented/Missing]
   
6. **Response Generation**: `[file:line]`
   - Data transformation: [Describe]
   - Sensitive data filtering: [Found/Not Found]

**Workflow Issues Discovered**:
- ⚠️ Missing transaction wrapper for multi-step operation
- ⚠️ No rollback mechanism if email fails
- ⚠️ Password stored before validation complete

#### Order Processing Workflow
[Similar detailed trace for each major workflow found]

### Complex Conditional Logic Analysis

[For complex business rules from Step 4]

#### Complex Decision Trees
**Location**: `[file:line]` - [Method name]
**Complexity**: [Number of nested conditions]
**Pseudocode**:
```
IF user.type == 'premium' THEN
  IF order.total > 100 THEN
    IF user.loyaltyPoints > 500 THEN
      discount = 20%
    ELSE
      discount = 10%
  ELSE
    discount = 5%
ELSE
  discount = 0%
```
**Business Rule**: Tiered discount system based on user status and order value
**Edge Cases**: [List any identified edge cases]

### Data Flow Analysis

[From Step 3 findings]

#### Data Transformations Map
| Location | Input Type | Output Type | Validation | Side Effects | Issues |
|----------|------------|-------------|------------|--------------|---------|
| `[file:line]` | UserDTO | UserEntity | ✓ Yes | Logs user creation | None |
| `[file:line]` | OrderRequest | Order | ❌ No | Updates cache | Missing validation |

#### Layer-to-Layer Data Flow
1. **API → Service Layer**:
   - Transformation at: `[file:line]`
   - Data loss: [Any fields dropped]
   - Data enrichment: [Any fields added]
   
2. **Service → Repository Layer**:
   - Transformation at: `[file:line]`
   - Type conversions: [List actual conversions]
   
3. **Repository → Database**:
   - ORM mapping at: `[file:line]`
   - Schema mismatches: [List if found]

### Business Rules Implementation

[From Step 4 findings]

#### Discovered Business Rules
1. **Inferred Rule**: User email must be unique
   - **Code Evidence**: `[actual code at file:line showing the check]`
   - **Implementation**: `[file:line]`
   - **Enforcement**: Database constraint + application check
   - **Validation Type**: Uniqueness constraint
   - **Gap**: No case-insensitive check
   
2. **Inferred Rule**: Order total must match sum of items
   - **Code Evidence**: `[actual calculation code at file:line]`
   - **Implementation**: `[file:line]`
   - **Enforcement**: Calculated on save
   - **Business Logic**: Sum validation
   - **Gap**: No validation on update

#### Missing Business Rules
[Based on typical business logic not found]
- ❌ No business hours validation for orders
- ❌ No duplicate order prevention (same items within X minutes)
- ❌ No fraud detection rules

### State Machine Analysis

[From workflow tracing]

#### Order Status Transitions
```
Discovered States: [List actual states found]
Transitions Found:
- pending → processing: `[file:line]`
- processing → shipped: `[file:line]`
- shipped → delivered: `[file:line]`

Missing Transitions:
- ❌ No cancellation flow
- ❌ No refund states
- ❌ No partial fulfillment
```

## External API Reliability Analysis

[From Step 7 findings]

### API Integration Resilience
| API Endpoint | Timeout | Retry | Circuit Breaker | Fallback | Risk Level |
|--------------|---------|-------|-----------------|----------|------------|
| Payment Gateway | ✓ 30s | ✓ 3x exponential | ❌ No | ❌ No | 🔴 High |
| Email Service | ❌ No | ❌ No | ❌ No | ✓ Queue | 🟡 Medium |
| Analytics | ✓ 5s | ❌ No | ❌ No | ✓ Silent fail | 🟢 Low |

### Missing Reliability Patterns
- **No timeout configuration**: `[file:line]` - API call without timeout
- **No retry logic**: `[file:line]` - Critical operation without retry
- **No circuit breaker**: Payment processing has no failure isolation
- **No fallback**: User creation fails completely if email fails

### Failure Scenarios Not Handled
1. **Payment Gateway Timeout**: No handling at `[file:line]`
   - Impact: User charged but order not created
   - Missing: Idempotency key implementation
   
2. **Email Service Down**: Hard failure at `[file:line]`
   - Impact: User registration blocked
   - Missing: Queue-based retry mechanism

## Discovered Performance Issues

### N+1 Query Problems

[Only document if found in Step 2]

**Found in**: `[actual-file.js:line]`
```javascript
// Actual code showing N+1 pattern
[Paste actual code from discovery]
```

**Evidence**: Loop at line [X] contains database query at line [Y]
**Impact**: [Calculate based on loop size if determinable]
**Fix**: Implement eager loading or batch query

### Missing Pagination

[Only document if found in Step 3]

**Endpoints without pagination**:
- `[actual-file.js:line]`: GET [endpoint] returns unbounded results
- Evidence: No LIMIT/OFFSET found in query at `[file:line]`

### Synchronous Blocking Operations

[Only document if found in Step 2]

**File**: `[actual-file.js:line]`
**Operation**: [readFileSync/execSync/etc.]
**Impact**: Blocks event loop for [estimated time if measurable]

## Code Quality Issues

### Duplicate Code Patterns

[Only document if found in Step 4]

**Duplication Found**:
- Function `[name]` duplicated [X] times:
  - `[file1.js:line]`
  - `[file2.js:line]`
  
**Validation Duplication**:
- Email validation: [Count] instances at:
  - `[file:line]` - [actual code snippet]
  - `[file:line]` - [actual code snippet]

### Technical Debt

[Only document if found in Step 5]

**TODO/FIXME Comments Found**: [Count]

Examples:
```
[file:line]: TODO: [actual comment]
    [context lines]

[file:line]: FIXME: [actual comment]
    [context lines]
```

**Large Files (>300 lines)**:
- `[file]`: [X] lines, [Y] functions, [Z] classes
  - Complexity indicators: [specific issues]

### Missing Error Handling

[Only document if found in Step 5]

**Empty Catch Blocks**:
- `[file:line]`: catch block with no error handling
- `[file:line]`: error swallowed without logging

**Unhandled Async Operations**:
- [Count] async calls without try/catch
- Examples at: `[file:line]`, `[file:line]`

## Business Logic Gaps

### Missing CRUD Operations

[Only document based on findings from Step 6]

**CRUD Analysis Results**:
[Paste actual output from CRUD analysis]

| Resource | Create | Read | Update | Delete | Evidence |
|----------|--------|------|--------|--------|----------|
| [name]   | [✓/❌] | [✓/❌] | [✓/❌]  | [✓/❌]  | [files where found/not found] |

**Missing Bulk Operations**:
- ❌ No bulk operations found in codebase
- Searched for: bulk*, batch*, multiple* patterns

### Missing User Experience Features

[Only document based on findings from Step 7]

**Loading States**:
- Async operations: [Count]
- Loading indicators: [Count]
- Coverage: [X]% of async operations have loading states

**Missing Loading States in**:
- `[file]`: [X] async operations, [Y] loading states

**Error Handling Coverage**:
- Try blocks: [Count]
- Async calls: [Count]
- Coverage: [X]% of async calls have error handling

**Retry Logic**:
- ❌ No retry mechanisms found
- Critical for: [list services that make external calls]

## Discovered Workflow Gaps

[Based on sequence diagram analysis from prompt #5]

**Missing Business Flows**:
[Only list if not found in sequence diagram analysis]
- Order cancellation: No cancellation endpoint or logic found
- Refund process: No refund handling detected
- Status transitions: Only [list found statuses]

**Transaction Integrity Issues**:
[Only if found during analysis]

**Multi-step Operations Without Transactions**:
- `[file:line]`: Multiple database operations without transaction wrapper
  - Operation 1: [actual code]
  - Operation 2: [actual code]
  - Risk: Partial failure could leave inconsistent state

## NOT FOUND (Expected But Missing)

Based on typical business applications, these expected elements were NOT FOUND:

### Performance Optimizations
- ❌ No caching layer detected (Redis, Memcached)
- ❌ No connection pooling configuration found
- ❌ No query optimization comments or indexes

### Business Features
- ❌ No audit logging for data changes
- ❌ No soft delete implementation
- ❌ No versioning for important entities
- ❌ No rate limiting on APIs

### Developer Experience
- ❌ No API documentation (OpenAPI/Swagger)
- ❌ No database migrations directory
- ❌ No seed data for development

## Evidence-Based Improvement Roadmap

### Immediate Actions (Based on Findings)

[Only include improvements for actual issues found]

**Quick Wins** (< 1 day effort):
1. **Add Missing Indexes** (if found in database analysis)
   - Tables without indexes: [list from prompt #4]
   - Estimated improvement: Based on query analysis
   
2. **Fix Empty Catch Blocks** (if found in Step 5)
   - Files: [list actual files]
   - Add proper error logging and handling

3. **Add Pagination** (if missing from endpoints)
   - Endpoints: [list actual endpoints without pagination]
   - Prevent unbounded result sets

### High Priority (1-3 days)
[Only based on discovered issues]

1. **Fix N+1 Queries** (if found)
   - Locations: [list actual files:lines]
   - Solution: Implement eager loading
   
2. **Implement Error Handling** (based on coverage analysis)
   - Coverage gap: [X]% of async operations unhandled
   - Focus on: [list specific files/components]

### Medium Priority (1 week)
[Only based on actual findings]

1. **Consolidate Duplicate Code**
   - Duplication found: [specific patterns]
   - Create shared utilities for: [list patterns]

2. **Complete CRUD Operations**
   - Resources missing operations: [list from analysis]
   - Implement: [specific missing operations]

## Validation Before Documentation

### Verify All Findings Are Evidence-Based

```bash
echo "=== Validating business analysis findings ==="

# Count actual issues found
N1_QUERIES=$(grep -c "forEach.*await" docs/code-review/6-BUSINESS_ANALYSIS.md 2>/dev/null || echo "0")
MISSING_PAGINATION=$(grep -c "NO PAGINATION FOUND" docs/code-review/6-BUSINESS_ANALYSIS.md 2>/dev/null || echo "0")
DUPLICATE_CODE=$(grep -c "duplicated.*times" docs/code-review/6-BUSINESS_ANALYSIS.md 2>/dev/null || echo "0")
EMPTY_CATCHES=$(grep -c "Empty Catch Blocks" docs/code-review/6-BUSINESS_ANALYSIS.md 2>/dev/null || echo "0")

echo "Documented issues:"
echo "- N+1 Queries: $N1_QUERIES"
echo "- Missing Pagination: $MISSING_PAGINATION"
echo "- Code Duplication: $DUPLICATE_CODE"
echo "- Empty Catch Blocks: $EMPTY_CATCHES"

# Ensure all have file:line references
echo "=== Checking evidence quality ==="
FILE_REFS=$(grep -c ":[0-9]" docs/code-review/6-BUSINESS_ANALYSIS.md 2>/dev/null || echo "0")
echo "File:line references: $FILE_REFS"
```

### Documentation Checklist

Before saving the business analysis:
- [ ] Every performance issue has file:line evidence
- [ ] Every missing feature references actual search results
- [ ] All improvements address discovered problems
- [ ] No hypothetical optimizations included
- [ ] ROI calculations based on actual measurements
- [ ] "NOT FOUND" section documents missing expected elements

## ROI Calculation (Based on Actual Findings)

[Only calculate ROI for discovered issues]

| Issue Found | Current Impact | Fix Effort | Expected Improvement | ROI Score |
|-------------|---------------|------------|---------------------|-----------|
| [Actual issue] | [Measured impact] | [Hours] | [Based on evidence] | [Calculate] |

**ROI Score Calculation**:
- Impact: Based on actual code patterns found
- Effort: Realistic estimates for specific fixes
- Value: Measurable improvement in performance/quality
````

## 6. Create Monitoring Script (Only If Issues Found)

[Only create if performance issues were discovered]

```bash
# Only create monitoring script if performance issues found
if [ "$N1_QUERIES" -gt 0 ] || [ "$MISSING_PAGINATION" -gt 0 ]; then
  cat > scripts/perf-monitor.js << 'EOF'
#!/usr/bin/env node

// Performance monitoring for discovered issues
const issues = {
  n1Queries: [/* List actual files with N+1 queries */],
  missingPagination: [/* List actual endpoints without pagination */],
  slowQueries: [/* List from database analysis */]
};

// Monitor only actual issues found during analysis
console.log('Monitoring:', issues);
EOF
fi
```


memory_store_chunk
content="Business improvement analysis completed. Performance issues: [count]. Quick wins: [count]. ROI opportunities: [high/medium/low]"
session_id="biz-analysis-$(date +%s)"
repository="github.com/org/repo"
tags=["improvements", "performance", "business-logic", "roi"]

memory_store_decision
decision="Improvement priority: [critical|high|medium]"
rationale="Found [X] performance bottlenecks, [Y] missing features, [Z] technical debt items. Quick wins available: [count]"
context="Highest ROI opportunity: [specific improvement] with [X]% impact"
session_id="biz-analysis-$(date +%s)"
repository="github.com/org/repo"

memory_tasks session_end session_id="biz-analysis-$(date +%s)" repository="github.com/org/repo"

```

## Execution Notes

- **Quick Wins First**: Start with high-impact, low-effort improvements to build momentum
- **Measure Everything**: Establish performance baselines before making changes
- **Business Impact**: Focus on improvements that directly affect user experience and revenue
- **Technical Debt**: Balance new features with refactoring to maintain code quality
- **Language Agnostic**: Adapts to any technology stack with appropriate performance patterns
```


## 🚨 CRITICAL: Evidence Validation Requirements

**MANDATORY FOR ALL FINDINGS:**
1. **Every optimization** MUST have file:line evidence from the bash scripts
2. **Every business rule** MUST show the actual code snippet, not just the inferred rule
3. **Every performance issue** MUST show actual slow code or inefficient patterns
4. **Every workflow gap** MUST reference missing implementations or TODOs
5. **NO hypothetical improvements** - only issues discovered through code analysis

**VALIDATION CHECKLIST before documenting any finding:**
- [ ] Does this finding have specific file:line evidence?
- [ ] Can I show the exact code that demonstrates this issue?
- [ ] Is this based on actual code analysis, not assumptions?
- [ ] Have I verified this isn't a false positive from the bash scripts?
- [ ] Is the business rule inference supported by the actual code?

**FALSE POSITIVE PREVENTION:**
- Comments containing keywords are NOT actual issues
- String literals containing patterns are NOT real operations
- Test files may contain patterns that don't reflect production code
- Imported functions may not be used in the analyzed workflow

## 📋 Todo List Generation

**REQUIRED**: Generate or append to `docs/code-review/code-review-todo-list.md` with findings from this analysis.

### Todo Entry Format - EVIDENCE-BASED ONLY
```markdown
## Business Analysis Findings

**Analysis Date**: [Date]
**Performance Issues**: [Count with file:line evidence]
**Business Logic Gaps**: [Count from CRUD analysis]
**Code Quality Issues**: [Count from duplication analysis]

### 🔴 CRITICAL (Immediate Action Required)
[Only for issues with severe performance/business impact]
- [ ] **Fix N+1 Query in [Component]**: Found at `[file:line]`
  - **Evidence**: Loop contains [X] database calls
  - **Impact**: [X]ms * [N] items = [total] latency
  - **Effort**: 2-4 hours
  - **Solution**: Implement eager loading

### 🟡 HIGH (Sprint Priority)
[Only for confirmed missing features or performance issues]
- [ ] **Add Pagination to [Endpoint]**: Missing at `[file:line]`
  - **Evidence**: No LIMIT clause in query
  - **Impact**: Unbounded results could return [estimate] records
  - **Effort**: 2 hours per endpoint
  - **Files**: `[actual files]`

### 🟢 MEDIUM (Backlog)
[Only for code quality issues with evidence]
- [ ] **Consolidate [Pattern] Validation**: Duplicated [X] times
  - **Evidence**: Found in files: [list with line numbers]
  - **Impact**: [X] lines of duplicate code
  - **Effort**: 4 hours to create shared utility

### 🔵 LOW (Future Consideration)
[Only minor issues found in analysis]

### ❌ MISSING BUSINESS FEATURES
- [ ] **No [Operation] for [Resource]**: CRUD analysis showed gap
  - **Evidence**: Only [X] of 4 CRUD operations implemented
  - **Missing**: [List specific operations]
  - **Business Impact**: [Specific impact]
```

### Implementation Rules
1. ONLY create todos for issues discovered in actual code
2. EVERY performance issue must have measurements or estimates
3. EVERY missing feature must reference the analysis that found it
4. NO hypothetical improvements without code evidence
5. Include "MISSING" section for expected but absent features
6. Tag with `#performance #business-logic #verified`