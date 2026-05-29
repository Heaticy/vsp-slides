# 4DSloMo：4D Reconstruction for High Speed Scene with Asynchronous Capture

4DSloMo 讨论的是如何用低帧率多相机系统实现高时间分辨率的 4D 重建。现有 4D 重建系统通常受限于相机成本、同步采集和数据传输带宽，实际帧率常停留在 30 FPS 左右。当场景包含衣物飘动、体育动作或快速物体交互时，低帧率会丢失大量中间运动信息，重建结果容易出现运动不连续和伪影。4DSloMo 的核心思路是把硬件采集策略和软件后处理结合起来，通过异步捕获提高有效时间分辨率，再用视频扩散模型修复稀疏视角重建带来的伪影。

## 异步捕获方案

传统多相机系统通常采用同步采集，所有相机在同一时刻触发，并以相同帧率记录图像。这样做能保证每个时间戳都有完整多视角信息，但两个连续帧之间的运动仍然是缺失的。4DSloMo 的 Asynchronous Capture Scheme 将 `N` 台相机分成 `K` 组，让不同组在略有错开的时间点触发。这样，在同一个时间窗口内，不同相机组记录到的是不同时间切片，相当于用空间视角数量换取更高时间分辨率。四组相机可以把 25 FPS 提升到等效 100 FPS，八组相机则可以提升到等效 200 FPS。

![异步捕获方案示意](https://picgo-server-vsplab-1328801592.cos.ap-shanghai.myqcloud.com/picgo-server-vsplab-1328801592/Picgo20260119230945.png)

论文系统由 12 个以 25 FPS 运行的相机组成，这些相机支持硬件同步触发，但研究团队人为引入不同的触发延迟，从而形成异步捕获。基于该阵列，作者采集了多种高速运动场景，包括舞蹈、体育活动和快速物体交互，构建了包含 12 个异步多视角视频序列的数据集。每个视频分辨率为 2048 x 2248，重点覆盖非线性、大幅度运动场景。

![异步多相机采集系统](https://picgo-server-vsplab-1328801592.cos.ap-shanghai.myqcloud.com/picgo-server-vsplab-1328801592/Picgo20260119233048.png)

## 伪影修复视频扩散模型

异步捕获虽然提高了时间分辨率，但也带来一个直接问题：每个时间戳可用的视角数量减少了 `K` 倍。同步采集时，一个时间点有完整多视角约束；异步采集后，同一时间点只对应部分相机视角，因此 4D 重建会出现稀疏视角问题，结果中容易产生浮动伪影。传统图像扩散模型可以修复单帧视觉质量，但在 4D 场景中容易破坏时间一致性，所以本文提出基于视频扩散模型的 artifact-fix 模块，专门去除稀疏视角 4D 重建产生的伪影，同时保持时序连贯。

![异步捕获导致的稀疏视角伪影](https://picgo-server-vsplab-1328801592.cos.ap-shanghai.myqcloud.com/picgo-server-vsplab-1328801592/Picgo20260119234759.png)

训练流程上，作者先使用初始 GS4D 模型从异步捕获数据重建出带伪影的视频，再将这些噪声视频与原始干净视频配对，形成监督数据。伪影修复模型基于预训练视频扩散模型 Wan2.1，并使用 LoRA 进行参数高效微调。模型以带伪影的渲染视频为输入，输出时间连贯的干净视频；修复结果再用于监督优化，让模型学习如何去除浮动伪影、恢复精细纹理，并保持跨帧一致性。训练数据还使用 DNA-Rendering 和 Neural3DV 等多视角数据集，通过时间下采样模拟低帧率捕获，再用 GS4D 重建出带伪影视频。

![伪影修复视频扩散模型训练流程](https://picgo-server-vsplab-1328801592.cos.ap-shanghai.myqcloud.com/picgo-server-vsplab-1328801592/Picgo20260120003555.png)

## 结果与观察

实验结果显示，4DSloMo 在 DNA-Rendering 和 Neural3DV 两个数据集上都取得了较好效果。消融实验说明，伪影修复模型对同步捕获视频的提升不明显，因为同步数据本身视角约束充分；但对于异步捕获产生的稀疏视角重建，artifact-fix 视频扩散模型能够有效去除浮动伪影，恢复细节纹理，并维持时间一致性。也就是说，4DSloMo 的收益来自硬件异步采集和软件修复模块的组合：前者提供高时间分辨率，后者补偿视角不足带来的重建质量问题。

![4DSloMo 消融结果](https://picgo-server-vsplab-1328801592.cos.ap-shanghai.myqcloud.com/picgo-server-vsplab-1328801592/Picgo20260120004243.png)

![DNA-Rendering 结果](https://picgo-server-vsplab-1328801592.cos.ap-shanghai.myqcloud.com/picgo-server-vsplab-1328801592/Picgo20260120003738.png)

![Neural3DV 结果](https://picgo-server-vsplab-1328801592.cos.ap-shanghai.myqcloud.com/picgo-server-vsplab-1328801592/Picgo20260120003753.png)

## LoRA 微调

LoRA，即 Low-Rank Adaptation，是一种面向大规模预训练模型的参数高效微调方法。它的做法是冻结预训练模型原有权重，只在 Transformer 等结构中的特定线性层注入可训练的低秩分解矩阵。相比全量微调，LoRA 可以显著减少可训练参数数量，降低 GPU 显存需求，同时在许多任务上保持接近甚至优于全量微调的效果。对 4DSloMo 而言，使用 LoRA 微调 Wan2.1 这类视频扩散模型，可以在较低训练成本下让模型适配 4D 重建伪影修复任务。

从公式上看，全量微调可写作 `h = W x`，训练时需要更新完整权重矩阵 `W`。LoRA 则冻结预训练权重 `W_0`，只学习一个低秩更新量 `AB`：

$$h = W_0 x + ABx$$

其中 `W_0` 的维度为 `n x m`，`A` 的维度为 `n x r`，`B` 的维度为 `r x m`，且 `r` 远小于 `n` 和 `m`。全量微调参数量为 `nm`，LoRA 参数量为 `nr + rm = r(n + m)`。实验观察表明，盲目增大秩 `r` 不一定带来更好效果，因此常用较小的 `r`，例如 `1, 2, 4, 8`。

![LoRA 秩选择观察](https://picgo-server-vsplab-1328801592.cos.ap-shanghai.myqcloud.com/picgo-server-vsplab-1328801592/Picgo20260123045409.png)

LoRA 对显存的节省主要来自反向传播时梯度计算量的减少。若直接写成 `Y = X(W_0 + AB)`，仍可能需要围绕完整权重形式组织梯度；更合理的实现是写成 `Y = XW_0 + XAB = XW_0 + ZB`，其中 `Z = XA`。由于 `W_0` 冻结，训练只需对 `A` 和 `B` 求梯度：

$$\frac{\partial L}{\partial A} = X^T \left(\frac{\partial L}{\partial Y} B^T\right)$$

$$\frac{\partial L}{\partial B} = (XA)^T \frac{\partial L}{\partial Y}$$

这样避免计算完整的 `dL/dW`，既节省显存，也减少计算量。相比 Prefix Tuning 和 Adapter，LoRA 的一个优势是它不会减少输入有效长度，也不会显著加深模型层数或引入推理延迟，因此更适合对已有大模型做轻量适配。

## 低秩分解的数学基础

LoRA 的合理性可以从矩阵范数和最优低秩近似理解。Frobenius 范数把矩阵所有元素平方求和再开根号：

$$\|M\|_F = \sqrt{\sum_{i=1}^{n} \sum_{j=1}^{m} M_{i,j}^2}$$

它满足正交不变性，即对正交矩阵 `Q`，有 `||QA||_F = ||A||_F`。这一性质使得奇异值分解能够用于分析低秩近似误差。对于任意矩阵 `M`，存在分解 `M = U Sigma V^T`，其中 `U` 和 `V` 为正交矩阵，`Sigma` 为非负对角奇异值矩阵。最优 `r` 秩近似只需保留前 `r` 个最大奇异值及对应奇异向量：

$$M_r = U_{[:,:r]} \Sigma_{[:r,:r]} V^T_{[:,:r]}$$

对应误差为：

$$\min_{\operatorname{rank}(X)\leq r} \|X - M\|_F^2 = \sum_{i=r+1}^{\min(m,n)} \sigma_i^2$$

这说明，当权重更新量可以被少数主要方向表达时，用低秩矩阵 `AB` 近似 `Delta W` 是有数学依据的。LoRA 正是利用这一点，把大模型微调限制在低秩子空间中，从而用很少参数完成任务适配。

## 简短总结

4DSloMo 的关键贡献是用异步多相机采集把低帧率硬件转化为高时间分辨率输入，再用视频扩散模型补偿稀疏视角带来的伪影。它不是单纯依赖更贵的相机，也不是只做后处理增强，而是通过采集策略和生成式修复模型共同解决高速 4D 重建问题。LoRA 和低秩分解部分则解释了为什么可以用较低成本微调大型视频扩散模型，使其适配 4D 重建伪影修复任务。
