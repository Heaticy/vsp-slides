---
marp: true
theme: tutorial-nailong
size: 16:9
paginate: true
---
<!-- _class: cover_e -->
<!-- _footer: "" -->
<!-- _paginate: "" -->

# VSP Marp Nailong
###### for tutorials

<div class="speaker-meta">

<span>Speaker</span> Presenter Name
<small>name@example.com</small>

</div>

---

## Contents
<!-- _class: trans -->
<!-- _footer: "" -->
<!-- _paginate: "" -->

---
## Contents
<!-- _class: toc_a -->
<!-- _header: "Contents" -->

- [Overview](#contents)
- [1. Slide Structure](#1-slide-structure-页面结构)
- [2. Layout Patterns](#2-layout-patterns-分栏与图片)
- [3. Emphasis Styles](#3-emphasis-styles-列表与引用)
- [4. Code Examples](#4-code-examples-代码块)

---
## 1. Slide Structure: 页面结构
<!-- _class: trans -->
<!-- _footer: "" -->
<!-- _paginate: "" -->

---
## 1. Slide Structure

这是一页标准正文示例。复制模板后，可以把这里替换成自己的主题概述。

- 关键点 A
- 关键点 B
- 关键点 C

---
## 1. Slide Structure
<!-- _class: fixedtitleA -->

固定标题 A。标题始终停留在页面顶部，正文区域用于承载较长说明。

---
## 1. Slide Structure
<!-- _class: fixedtitleB -->

<div class="div">

固定标题 B。适合需要更强标题标签和独立正文区域的页面。

</div>

---
## 2. Layout Patterns: 分栏与图片
<!-- _class: trans -->
<!-- _footer: "" -->
<!-- _paginate: "" -->

---
## 2. Layout Patterns
<!-- _class: cols-2 -->

<div class="ldiv">

左侧内容

- 要点 1
- 要点 2
- 要点 3

</div>

<div class="rdiv">

右侧内容

- 细节 A
- 细节 B
- 细节 C

</div>

---
## 2. Layout Patterns
<!-- _class: cols-2 -->
<!-- Others: cols-2-64, cols-2-37, cols-2-73, cols-2-46, cols-3, rows-2-55, rows-2-28, pin-3 -->

<div class="ldiv">

当页面需要视觉重点时，可以使用图片分栏。普通分栏会保留完整标题行，正文和图片从标题下方开始。

- 图片说明保持简短
- 保留足够留白
- 避免文字挤压图片

</div>

<div class="rimg">

<!-- You can replace this image with your own background or teaching image. -->
![h:520px #c](https://heaticy-1310163554.cos.ap-shanghai.myqcloud.com/markdown/vsp-marp/assets/nailong/nailong-wave.png)

</div>

---
## 2. Right Fill Text
<!-- _class: cols-2 right-fill right-fill-text -->

<div class="ldiv">

左栏保留标题和主要说明。加上 `right-fill` 后，左栏正文仍然会避开标题，但不会浪费整行标题高度。

- 适合双栏文字对比
- 左栏作为背景、问题或约束
- 标题不会挤占右栏顶部

</div>

<div class="rdiv">

右栏文字从页面顶部开始排版，可以利用原本标题右侧的空间。

- 适合放方案、结论或对照项
- 比普通双栏多一段可用高度
- 不需要图片也能使用 `right-fill`

</div>

---
## 2. Right Fill
<!-- _class: cols-2-46 right-fill -->

<div class="ldiv">

`right-fill` 用在图片更重要的页面。右侧图片从页面顶部开始占满右栏，左侧标题和正文都保留在左栏。

- 适合人物图、产品图、实验场景图
- 左侧只放结论或必要说明
- 右侧图片不要被强行拉伸

</div>

<div class="rimg full-height">

<!-- You can replace this image with your own figure; right-fill lets it use the title-side space. -->
![h:650px #c](https://heaticy-1310163554.cos.ap-shanghai.myqcloud.com/markdown/vsp-marp/assets/nailong/nailong-wave.png)

</div>

---
## 2. Layout Patterns
<!-- _class: rows-2-28 -->

<div class="tdiv">

很扁且细节多的宽图不要硬塞进左右分栏。这里使用 `rows-2-28`，让说明占少量空间，图片获得更高的展示区域。

</div>

<div class="bimg wide-figure">

<!-- Replace this with your own wide background image when the aspect ratio is very flat. -->
![w:880px #c](https://heaticy-1310163554.cos.ap-shanghai.myqcloud.com/markdown/vsp-marp/assets/backgrounds/vortex-figure-18.png)

</div>

---
## 2. Layout Patterns
<!-- _class: cols-2-64 -->

<div class="ldiv">

图片比较窄或接近竖图时，让文字占 60%，图片占 40%。适合人物图、设备图或只需要辅助展示的小图。

</div>

<div class="rimg wide-figure">

![h:400px #c](https://heaticy-1310163554.cos.ap-shanghai.myqcloud.com/markdown/vsp-marp/assets/nailong/nailong-wave.png)

</div>

---
## 2. Layout Patterns
<!-- _class: cols-2-37 -->

<div class="ldiv">

横向图片信息比较多时，让图片占更大空间。左侧只保留结论、提示或简短说明，适合截图、流程图或宽幅结果图。

</div>

<div class="rimg">

![w:760px #c](https://heaticy-1310163554.cos.ap-shanghai.myqcloud.com/markdown/vsp-marp/assets/backgrounds/vortex-figure-18.png)

</div>

---
## 2. Layout Patterns
<!-- _class: cols-3 -->
<!-- 三列图片只适合长宽比接近、细节密度接近的并列图片；宽图用上下排版，竖图或主体图用左右分栏。 -->

<div class="limg">

![h:380px #c](https://heaticy-1310163554.cos.ap-shanghai.myqcloud.com/markdown/vsp-marp/assets/nailong/nailong-wave.png)

</div>

<div class="mimg">

![h:380px #c](https://heaticy-1310163554.cos.ap-shanghai.myqcloud.com/markdown/vsp-marp/assets/nailong/nailong-hug.png)

</div>

<div class="rimg">

![h:380px #c](https://heaticy-1310163554.cos.ap-shanghai.myqcloud.com/markdown/vsp-marp/assets/nailong/nailong-wave.png)

</div>

---
## 3. Emphasis Styles: 列表与引用
<!-- _class: trans -->
<!-- _footer: "" -->
<!-- _paginate: "" -->

---
## 3. Emphasis Styles

VSP Marp 提供多种列表和提示框样式，适合教学展示使用。下面几页分别展示双列列表、单列流程、强调引用和代码块。

- `cols2_ol_sq` / `cols2_ol_ci`：双列有序列表
- `cols2_ul_sq` / `cols2_ul_ci`：双列无序列表
- `col1_ol_sq` / `col1_ol_ci`：单列步骤列表
- `bq-*`：强调引用提示框
- fenced code block：代码块与命令行示例

---
## 3. Emphasis Styles
<!-- _class: cols2_ol_sq -->

1. 明确问题背景
2. 给出核心定义
3. 展示关键公式
4. 分析边界条件
5. 对比实验结果
6. 总结主要结论

---
## 3. Emphasis Styles
<!-- _class: cols2_ul_ci -->

- 适合并列展示多个要点
- 每个条目保持短句
- 左右两列自动排布
- 用于课堂提示或报告 checklist
- 避免单页塞入过长段落
- 需要细讲时拆成多页

---
## 3. Emphasis Styles
<!-- _class: col1_ol_ci -->

- 先说明上下文和输入条件
- 再给出方法、规则或推导步骤
- 最后补充注意事项和常见错误

---
## 3. Emphasis Styles
<!-- _class: bq-yellow -->

> 强调引用
>
> 适合突出课堂提示、注意事项或阶段性结论。

---
## 4. Code Examples: 代码块
<!-- _class: trans -->
<!-- _footer: "" -->
<!-- _paginate: "" -->

---
## 4. Code Examples

命令行代码适合展示安装、构建和运行步骤。保持命令短、注释少，避免一页放太多终端输出。

```bash
sudo apt install make
make build
make test
```

---
## 4. Code Examples

Makefile 或配置类代码适合分块展示：先给最小规则，再解释变量和依赖关系。

```makefile
CXX := g++
CXXFLAGS := -Wall -O2

app: main.o utils.o
	$(CXX) $^ -o $@

%.o: %.cpp
	$(CXX) $(CXXFLAGS) -c $< -o $@
```

---
<!-- _class: lastpage -->
<!-- _header: "" -->
<!-- _footer: "" -->
<!-- _paginate: "" -->

###### Thank You

<div class="icons">

- VSP Marp
- Tutorial template
- Nailong theme

</div>
