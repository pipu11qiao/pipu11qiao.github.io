let user = {
  name: "John",
  _password: "***",
};

const userProxy = new Proxy(user, {
  get(target, prop) {
    if (prop.startsWith("_")) {
      throw new Error("Access denied");
    }
    let value = target[prop];
    return typeof value === "function" ? value.bind(target) : value; // (*)
  },
  set(target, prop, val) {
    if (prop.startsWith("_")) {
      throw new Error("Access denied");
    } else {
      target[prop] = val;
      return true;
    }
  },
  deleteProperty(target, prop) {
    // 拦截属性删除
    if (prop.startsWith("_")) {
      throw new Error("Access denied");
    } else {
      delete target[prop];
      return true;
    }
  },
  ownKeys(target) {
    // 拦截读取属性列表
    return Object.keys(target).filter((key) => !key.startsWith("_"));
  },
});


// "get" 不允许读取 _password
try {
  console.log(userProxy._password); // Error: Access denied
} catch(e) { console.log(e.message); }

// "set" 不允许写入 _password
try {
  userProxy._password = "test"; // Error: Access denied
} catch(e) { console.log(e.message); }

// "deleteProperty" 不允许删除 _password
try {
  delete userProxy._password; // Error: Access denied
} catch(e) { console.log(e.message); }

// "ownKeys" 将 _password 过滤出去
for(let key in userProxy) console.log(key); // name