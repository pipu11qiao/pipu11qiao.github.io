# Redux Toolkit

Redux Toolkit 是 Redux 官方强烈推荐，开箱即用的一个高效的 Redux 开发工具集。它旨在成为标准的 Redux 逻辑开发模式，我们强烈建议你使用它。

包含了什么
Redux Toolkit 包含：

* configureStore()：封装了createStore，简化配置项，提供一些现成的默认配置项。它可以自动组合 slice 的 reducer，可以添加任何 Redux 中间件，默认情况下包含 redux-thunk，并开启了 Redux DevTools 扩展。
* createReducer() 帮你将 action type 映射到 reducer 函数，而不是编写 switch...case 语句。另外，它会自动使用 immer 库来让你使用普通的 mutable 代码编写更简单的 immutable 更新，例如 state.todos[3].completed = true。
* createAction() 生成给定 action type 字符串的 action creator 函数。该函数本身已定义了 toString()，因此可以代替常量类型使用。
* createSlice() 接收一组 reducer 函数的对象，一个 slice 切片名和初始状态 initial state，并自动生成具有相应 action creator 和 action type 的 slice reducer。
* createAsyncThunk: 接收一个 action type 字符串和一个返回值为 promise 的函数, 并生成一个 thunk 函数，这个 thunk 函数可以基于之前那个 promise ，dispatch 一组 type 为 pending/fulfilled/rejected 的 action。
* createEntityAdapter: 生成一系列可复用的 reducer 和 selector，从而管理 store 中的规范化数据。
* createSelector 来源于 Reselect 库，重新 export 出来以方便使用。