// compose

function compose(middleware) {
  return function (ctx, next) {
    let index = -1;
    return dispatch(0);
    function dispatch(i) {
      if (i <= index) return Promise.reject("next() called multiple times");
      index = i;
      let fn = middleware[i];
      if (i === middleware.length) {
        fn = next;
      }
      if (!fn) return Promise.resolve();
      try {
        return Promise.resolve(
          fn(ctx, function () {
            return dispatch(i + 1);
          })
        );
      } catch (err) {
        return Promise.reject(err);
      }
    }
  };
}
