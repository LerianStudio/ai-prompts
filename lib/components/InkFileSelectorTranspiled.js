"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;
const _react = _interopRequireWildcard(require("react"));
const _ink = require("ink");
const _inkSelectInput = _interopRequireDefault(require("ink-select-input"));
const _path = _interopRequireDefault(require("path"));
function _interopRequireDefault(e) { return e && e.__esModule ? e : { default: e }; }
function _interopRequireWildcard(e, t) { if ("function" === typeof WeakMap) {var r = new WeakMap(), n = new WeakMap();} return (_interopRequireWildcard = function (e, t) { if (!t && e && e.__esModule) {return e;} let o, i, f = { __proto__: null, default: e }; if (null === e || "object" !== typeof e && "function" !== typeof e) {return f;} if (o = t ? n : r) { if (o.has(e)) {return o.get(e);} o.set(e, f); } for (const t in e) {"default" !== t && {}.hasOwnProperty.call(e, t) && ((i = (o = Object.defineProperty) && Object.getOwnPropertyDescriptor(e, t)) && (i.get || i.set) ? o(f, t, i) : f[t] = e[t]);} return f; })(e, t); }
/**
 * InkFileSelector.jsx
 * Modern Ink-based file selector (JSX source)
 *
 * This is the JSX source that gets transpiled to CommonJS for CLI usage.
 * This provides the beautiful modern interface we built to replace the broken TUI.
 */

const InkFileSelector = ({
  files,
  onComplete
}) => {
  const {
    exit
  } = (0, _ink.useApp)();
  const [selectedFiles, setSelectedFiles] = (0, _react.useState)(new Set());
  const [currentIndex, setCurrentIndex] = (0, _react.useState)(0);

  // Transform files for SelectInput
  const selectItems = files.map((file, index) => {
    const isSelected = selectedFiles.has(file);
    const checkbox = isSelected ? '[✓]' : '[ ]';
    const icon = getChangeIcon(file.changeType);
    const fileName = _path.default.basename(file.path);
    return {
      label: `${checkbox} ${icon} ${fileName}`,
      value: file,
      key: index
    };
  });

  // Global keyboard shortcuts
  (0, _ink.useInput)((input, key) => {
    if (key.escape || input === 'q') {
      handleComplete([]);
      return;
    }
    switch (input) {
      case 'a':
        setSelectedFiles(new Set(files));
        break;
      case 'i':
        const newSelection = new Set();
        files.forEach(file => {
          if (!selectedFiles.has(file)) {
            newSelection.add(file);
          }
        });
        setSelectedFiles(newSelection);
        break;
      case 'c':
        setSelectedFiles(new Set());
        break;
    }
  });
  const handleFileSelect = item => {
    const file = item.value;
    const newSelection = new Set(selectedFiles);
    if (selectedFiles.has(file)) {
      newSelection.delete(file);
    } else {
      newSelection.add(file);
    }
    setSelectedFiles(newSelection);
    setCurrentIndex(files.findIndex(f => f === file));
  };
  const handleSubmit = () => {
    handleComplete(Array.from(selectedFiles));
  };
  const handleComplete = selected => {
    if (onComplete) {
      onComplete(selected);
    }
    exit();
  };
  const currentFile = files[currentIndex] || null;
  return /*#__PURE__*/_react.default.createElement(_ink.Box, {
    flexDirection: "column"
  }, /*#__PURE__*/_react.default.createElement(_ink.Text, {
    bold: true,
    color: "cyan"
  }, "\uD83C\uDFAF Interactive File Selector"), /*#__PURE__*/_react.default.createElement(_ink.Text, {
    color: "gray"
  }, "Selected: ", selectedFiles.size, " / ", files.length), /*#__PURE__*/_react.default.createElement(_ink.Box, {
    marginTop: 1,
    flexGrow: 1
  }, files.length > 0 ? /*#__PURE__*/_react.default.createElement(_inkSelectInput.default, {
    items: selectItems,
    onSelect: handleFileSelect,
    onSubmit: handleSubmit,
    indicatorComponent: ({
      isHighlighted
    }) => /*#__PURE__*/_react.default.createElement(_ink.Text, {
      color: isHighlighted ? 'cyan' : 'gray'
    }, isHighlighted ? '→' : ' ')
  }) : /*#__PURE__*/_react.default.createElement(_ink.Text, {
    color: "yellow"
  }, "No files to sync")), currentFile && /*#__PURE__*/_react.default.createElement(_ink.Box, {
    marginTop: 1,
    paddingX: 1,
    borderStyle: "single",
    borderColor: "gray"
  }, /*#__PURE__*/_react.default.createElement(_ink.Box, {
    flexDirection: "column"
  }, /*#__PURE__*/_react.default.createElement(_ink.Box, null, /*#__PURE__*/_react.default.createElement(_ink.Text, {
    color: "gray"
  }, "Path: "), /*#__PURE__*/_react.default.createElement(_ink.Text, null, currentFile.path)), /*#__PURE__*/_react.default.createElement(_ink.Box, null, /*#__PURE__*/_react.default.createElement(_ink.Text, {
    color: "gray"
  }, "Type: "), /*#__PURE__*/_react.default.createElement(_ink.Text, {
    color: getChangeTypeColor(currentFile.changeType)
  }, getChangeIcon(currentFile.changeType), ' ', currentFile.changeType.toUpperCase())), currentFile.reason && /*#__PURE__*/_react.default.createElement(_ink.Box, null, /*#__PURE__*/_react.default.createElement(_ink.Text, {
    color: "gray"
  }, "Reason: "), /*#__PURE__*/_react.default.createElement(_ink.Text, null, currentFile.reason)))), /*#__PURE__*/_react.default.createElement(_ink.Box, {
    marginTop: 1,
    paddingX: 1,
    borderStyle: "single",
    borderColor: "gray"
  }, /*#__PURE__*/_react.default.createElement(_ink.Text, {
    dimColor: true
  }, "Space/Enter: Toggle \u2022 a: All \u2022 i: Invert \u2022 c: Clear \u2022 q: Cancel")));
};
function getChangeIcon(changeType) {
  const icons = {
    new: '🆕',
    modified: '📝',
    deleted: '🗑️',
    moved: '🔀'
  };
  return icons[changeType] || '❓';
}
function getChangeTypeColor(changeType) {
  const colors = {
    new: 'green',
    modified: 'yellow',
    deleted: 'red',
    moved: 'blue'
  };
  return colors[changeType] || 'white';
}
class InkFileSelectorApp {
  constructor(files, options = {}) {
    this.files = files || [];
    this.options = options;
  }
  async show() {
    return new Promise(resolve => {
      let selectedFiles = [];
      const App = () => /*#__PURE__*/_react.default.createElement(InkFileSelector, {
        files: this.files,
        onComplete: selected => {
          selectedFiles = selected;
          resolve(selectedFiles);
        }
      });
      (0, _ink.render)(/*#__PURE__*/_react.default.createElement(App, null));
    });
  }
}
const _default = exports.default = InkFileSelectorApp;
