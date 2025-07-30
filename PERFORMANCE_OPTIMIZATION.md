# 性能优化说明

## 已实施的优化措施

### 1. 相机系统优化
- **问题**: 每帧都在检查相机缩放值，造成不必要的性能开销
- **解决方案**: 
  - 使用 Jotai store 订阅机制，只在值变化时更新相机
  - 移除了频繁的 `onUpdate` 检查
  - 缓存上一次的缩放值，避免重复更新

### 2. 玩家控制优化
- **问题**: 重复检查模态框状态，方向判断逻辑冗余
- **解决方案**:
  - 缓存模态框状态，避免每帧重复获取
  - 优化方向判断逻辑，使用更简洁的条件判断
  - 减少不必要的动画状态检查

### 3. 渲染优化
- **问题**: 像素密度过高，影响性能
- **解决方案**:
  - 将 `pixelDensity` 从 2 降低到 1
  - 保持视觉效果的同时提升性能

### 4. 开发工具优化
- **问题**: 过多的 console.log 影响性能
- **解决方案**:
  - 移除所有调试用的 console.log
  - 添加性能监控工具，只在需要时输出性能信息

### 5. Vite 配置优化
- **问题**: 构建配置过于简单，缺少优化
- **解决方案**:
  - 添加代码分割，将 vendor、game、state 分别打包
  - 启用 terser 压缩
  - 优化依赖预构建
  - 禁用 HMR overlay 减少开发时开销

## 性能监控

项目现在包含性能监控工具，会每秒输出以下指标：
- **FPS**: 帧率
- **FrameTime**: 每帧耗时
- **Memory**: 内存使用量

## 进一步优化建议

### 1. 资源加载优化
```javascript
// 可以考虑使用懒加载
const loadResource = async (url) => {
  if (cache.has(url)) return cache.get(url);
  const resource = await fetch(url);
  cache.set(url, resource);
  return resource;
};
```

### 2. 对象池模式
```javascript
// 对于频繁创建销毁的对象，使用对象池
class ObjectPool {
  constructor(createFn) {
    this.pool = [];
    this.createFn = createFn;
  }
  
  get() {
    return this.pool.pop() || this.createFn();
  }
  
  release(obj) {
    this.pool.push(obj);
  }
}
```

### 3. 事件委托
```javascript
// 减少事件监听器数量
document.addEventListener('click', (e) => {
  if (e.target.matches('.camera-controller-btn')) {
    // 处理相机控制按钮点击
  }
});
```

## 性能测试

运行项目后，打开浏览器开发者工具的控制台，你会看到类似这样的性能信息：
```
Performance: FPS=60, FrameTime=16.67ms, Memory=45.23MB
```

如果 FPS 低于 30 或内存使用超过 100MB，可能需要进一步优化。

## 开发模式优化

在开发模式下，可以临时禁用一些功能来提升性能：
- 禁用性能监控：注释掉 `performanceMonitor.update()`
- 降低渲染质量：临时设置 `pixelDensity: 0.5`
- 减少动画帧数：调整动画的 `loop` 参数 