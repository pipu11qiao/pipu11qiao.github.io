## `peerDependencies 得作用


`peerDependencies` 在 `package.json` 文件中是一个非常重要的字段，特别是当你正在开发一个库或者一个插件时。它用于指定你的包与其他包之间的“同侪依赖关系”（Peer Dependency）。这里是一些关键点：

### 作用：

1. **避免版本冲突**：当多个包依赖于同一个包但不同版本时，`peerDependencies` 可以确保只有一个版本被安装。
  
2. **减少冗余**：通过使用 `peerDependencies`，你可以避免在每个依赖包中都安装相同的依赖，从而减少项目的大小。
  
3. **确保兼容性**：它允许库作者明确指出他们的库需要哪个版本的依赖，以确保所有的库都能正常工作。

### 示例：

假设你正在使用 React 和一个名为 `my-awesome-library` 的第三方库，该库也依赖于 React。

```json
// my-awesome-library 的 package.json
{
  "peerDependencies": {
    "react": "^17.0.0"
  }
}
```

这意味着 `my-awesome-library` 需要 React 17.0.0 或更高版本才能正常工作。当你在项目中安装 `my-awesome-library` 时，npm 或 yarn 会检查是否已经安装了符合条件的 React 版本。如果没有，它会给出警告。

### 如何使用（以 TypeScript 和 React 为例）：

在你的 `package.json` 文件中添加：

```json
{
  "peerDependencies": {
    "react": "^17.0.0",
    "typescript": "^4.0.0"
  }
}
```

这样，当其他人使用你的库时，包管理器会检查这些 `peerDependencies` 是否已经在他们的项目中安装。

### 注意事项：

- `peerDependencies` 不会自动安装。开发者需要手动安装这些依赖。
- 如果 `peerDependencies` 指定的版本与项目中已有的版本不兼容，包管理器会发出警告。

这个特性在使用诸如 React, TypeScript, AntD 等技术栈时特别有用，因为这些库通常需要与其他库共享某些依赖。