# 私有npm库搭建 

搭建私有的 npm 库可以让你在团队或组织内部共享和管理自定义的 npm 包。以下是使用 Verdaccio 搭建私有 npm 库的步骤：

### 1. 安装 Verdaccio

Verdaccio 是一个流行的私有 npm 库管理工具。首先，你需要全局安装 Verdaccio：

```bash
npm install -g verdaccio
```

### 2. 启动 Verdaccio

安装完成后，你可以通过以下命令启动 Verdaccio：

```bash
verdaccio
```

这将在本地启动一个 Verdaccio 服务器，默认端口为 4873。

### 3. 配置 Verdaccio

你可以在 Verdaccio 的配置文件中进行详细配置。配置文件通常位于 `~/.config/verdaccio/config.yaml`。你可以在其中设置用户权限、上游代理、监听端口等。

### 4. 创建用户并登录

你可以使用以下命令创建用户并登录：

```bash
npm adduser --registry http://localhost:4873
```

按照提示输入用户名、密码和邮箱地址。

### 5. 发布包

在你的项目目录下，确保 `package.json` 文件中的 `name` 和 `version` 字段已设置。然后运行以下命令发布包：

```bash
npm publish --registry http://localhost:4873
```

### 6. 安装私有包

你现在可以像安装普通 npm 包一样安装你的私有包：

```bash
npm install <包名> --registry http://localhost:4873
```

### 7. 集成到项目

你可以在项目中使用 `.npmrc` 文件来设置私有库地址，这样就不需要每次安装包时都指定 registry 了：

```ini
registry=http://localhost:4873
```

### 总结

通过以上步骤，你可以在本地搭建一个私有 npm 库，并能够发布和安装私有包。你还可以进一步配置 Verdaccio，例如设置 HTTPS、集成外部身份验证等。

如果你的团队或组织规模较大，可能还需要考虑备份、监控、负载均衡等问题。在生产环境中部署私有 npm 库可能需要更多的配置和维护工作。


#  verdaccio 使用docker在本地启用


使用 Docker 在本地启动 Verdaccio 是一个很好的选择，可以确保环境的一致性并简化部署过程。以下是使用 Docker 在本地启动 Verdaccio 的步骤：

### 1. 拉取 Verdaccio 镜像

首先，你需要从 Docker Hub 拉取 Verdaccio 的官方镜像：

```bash
docker pull verdaccio/verdaccio
```

### 2. 创建配置文件

你可以创建一个 Verdaccio 的配置文件，例如 `config.yaml`，并在其中进行自定义配置。以下是一个基本的配置示例：

```yaml
storage: /verdaccio/storage
auth:
  htpasswd:
    file: /verdaccio/conf/htpasswd
    max_users: 1000
uplinks:
  npmjs:
    url: https://registry.npmjs.org/
packages:
  '**':
    access: $all
    publish: $authenticated
    proxy: npmjs
```

### 3. 启动 Verdaccio 容器

使用以下命令启动 Verdaccio 容器，并将配置文件挂载到容器中：

```bash
docker run -it --name verdaccio -p 4873:4873 -v /path/to/config.yaml:/verdaccio/conf/config.yaml verdaccio/verdaccio
```

请将 `/path/to/config.yaml` 替换为你的配置文件的实际路径。

### 4. 访问 Verdaccio

现在，你应该可以通过浏览器访问 `http://localhost:4873` 来查看 Verdaccio 的 Web 界面。

### 5. 发布和安装包

你可以按照之前的说明创建用户、发布包和安装包，只需确保使用正确的 registry 地址，即 `http://localhost:4873`。

### 总结

使用 Docker 启动 Verdaccio 可以让你轻松地在不同的环境中部署和管理私有 npm 库。你还可以使用 Docker Compose 来管理 Verdaccio 和其他相关服务，或者使用 Kubernetes 来在更大规模的环境中部署 Verdaccio。

# docker 安装的verdaccio 添加用户没有权限

当你在Docker容器中运行Verdaccio并尝试添加用户时遇到权限问题，通常是因为容器内的Verdaccio进程没有足够的权限来写入配置文件。以下是一些可能的解决方案：

1. **更改配置文件的所有者或权限**：
   如果你将配置文件挂载到了容器外部，你可以在宿主机上更改文件的所有者或权限。例如：
   ```bash
   sudo chown 1000:1000 /verdaccio/conf/htpasswd
   sudo chmod 666 /verdaccio/conf/htpasswd
   ```

2. **使用Docker的用户选项**：
   你可以在启动容器时使用`--user`选项来指定运行容器的用户ID和组ID。例如：
   ```bash
   docker run --user 1000:1000 -it --name verdaccio ...
   ```

3. **更改Dockerfile**：
   如果你有访问Dockerfile，你可以在其中添加命令来更改文件所有者或权限。例如：
   ```Dockerfile
   RUN chown verdaccio:verdaccio /verdaccio/conf/htpasswd
   ```

4. **使用Docker Compose**：
   如果你使用Docker Compose，你可以在`docker-compose.yml`文件中设置用户和权限。例如：
   ```yaml
   services:
     verdaccio:
       user: "1000:1000"
       ...
   ```

请注意，上述解决方案可能需要根据你的具体情况进行调整。在更改所有者或权限之前，请确保了解这些更改的含义和潜在风险，并确保它们符合你的安全策略。




添加用户

> npm adduser --registry http://localhost:4873/

发布

> npm publish --registry http://localhost:4873/