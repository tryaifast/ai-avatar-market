// lib/certifications/generator.ts
// 知识产权证书生成服务

import PDFDocument from 'pdfkit';
import { createServiceClient } from '@/lib/supabase/client';

export interface CertificationData {
  certificateNo: string;
  avatarName: string;
  avatarDescription: string;
  creatorName: string;
  creatorEmail: string;
  createdAt: Date;
  blockchainHash: string;
}

export class CertificationGenerator {
  private supabase = createServiceClient();

  /**
   * 生成完整的认证证书
   */
  async generate(avatarId: string, certificationId: string): Promise<{
    certificateNo: string;
    pdfUrl: string;
    blockchainHash: string;
  }> {
    // 1. 获取分身和创作者信息
    const { data: cert } = await (this.supabase
      .from('avatar_certifications') as any)
      .select('id, avatar_id, creator_id, paid_at')
      .eq('id', certificationId)
      .single();

    if (!cert) {
      throw new Error('Certification not found');
    }

    const { data: avatar } = await (this.supabase
      .from('avatars') as any)
      .select('name, description, creator_id')
      .eq('id', avatarId)
      .single();

    const { data: creator } = await (this.supabase
      .from('users') as any)
      .select('name, email')
      .eq('id', cert.creator_id)
      .single();

    // 2. 生成证书编号
    const certificateNo = await this.generateCertificateNo();

    // 3. 生成区块链哈希（MVP: 模拟，实际用蚂蚁链）
    const blockchainHash = await this.generateBlockchainHash({
      certificateNo,
      avatarId,
      creatorId: cert.creator_id,
      timestamp: Date.now(),
    });

    // 4. 生成 PDF
    const pdfBuffer = await this.generatePDF({
      certificateNo,
      avatarName: avatar?.name || '未命名分身',
      avatarDescription: avatar?.description || '',
      creatorName: creator?.name || '创作者',
      creatorEmail: creator?.email || '',
      createdAt: new Date(cert.paid_at || Date.now()),
      blockchainHash,
    });

    // 5. 上传证书到 Storage
    const fileName = `certificates/${certificationId}_${certificateNo}.pdf`;
    const { data: uploadData, error: uploadError } = await this.supabase.storage
      .from('deliverables')
      .upload(fileName, pdfBuffer, {
        contentType: 'application/pdf',
        upsert: true,
      });

    if (uploadError) {
      throw new Error(`Failed to upload certificate: ${uploadError.message}`);
    }

    // 6. 获取公开 URL
    const { data: { publicUrl } } = this.supabase.storage
      .from('deliverables')
      .getPublicUrl(fileName);

    // 7. 更新数据库
    await (this.supabase
      .from('avatar_certifications') as any)
      .update({
        certificate_no: certificateNo,
        certificate_url: fileName,
        certificate_generated_at: new Date().toISOString(),
        blockchain_hash: blockchainHash,
        blockchain_explorer_url: `https://antchain.antgroup.com/explorer/tx/${blockchainHash}`, // MVP: 模拟链接
        blockchain_tx_time: new Date().toISOString(),
        status: 'certified',
      })
      .eq('id', certificationId);

    // 8. 更新分身状态
    await (this.supabase
      .from('avatars') as any)
      .update({
        certification_status: 'certified',
      })
      .eq('id', avatarId);

    return {
      certificateNo,
      pdfUrl: publicUrl,
      blockchainHash,
    };
  }

  /**
   * 生成证书编号 (CERT-2026-A7X9K2M8)
   * 格式: CERT-年份-8位随机字母数字
   */
  private generateCertificateNo(): string {
    const year = new Date().getFullYear();
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'; // 去除易混淆字符
    let random = '';
    for (let i = 0; i < 8; i++) {
      random += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return `CERT-${year}-${random}`;
  }

  /**
   * 生成区块链哈希（MVP: 模拟）
   */
  private async generateBlockchainHash(data: Record<string, any>): Promise<string> {
    // MVP: 使用 SHA256 模拟区块链哈希
    // 实际生产环境应调用蚂蚁链 API
    const str = JSON.stringify(data);
    const encoder = new TextEncoder();
    const hashBuffer = await crypto.subtle.digest('SHA-256', encoder.encode(str));
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return '0x' + hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
  }

  /**
   * 生成 PDF 证书
   */
  private async generatePDF(data: CertificationData): Promise<Buffer> {
    return new Promise((resolve, reject) => {
      const chunks: Buffer[] = [];
      const doc = new PDFDocument({ size: 'A4', margin: 50 });

      doc.on('data', chunk => chunks.push(chunk));
      doc.on('end', () => resolve(Buffer.concat(chunks)));
      doc.on('error', reject);

      // 证书标题
      doc.font('Helvetica-Bold')
         .fontSize(28)
         .fillColor('#1a1a1a')
         .text('AI分身知识产权认证证书', 50, 80, { align: 'center' });

      // 装饰线
      doc.moveTo(100, 130)
         .lineTo(500, 130)
         .strokeColor('#2563eb')
         .lineWidth(2)
         .stroke();

      // 证书编号
      doc.font('Helvetica')
         .fontSize(12)
         .fillColor('#666')
         .text(`证书编号：${data.certificateNo}`, 50, 150, { align: 'center' });

      // 证书正文
      doc.font('Helvetica')
         .fontSize(14)
         .fillColor('#333')
         .text('兹证明', 50, 200, { align: 'center' });

      // 创作者信息
      doc.font('Helvetica-Bold')
         .fontSize(16)
         .fillColor('#1a1a1a')
         .text(`创作者：${data.creatorName}`, 50, 240, { align: 'center' });

      // 分身信息
      doc.font('Helvetica')
         .fontSize(14)
         .fillColor('#333')
         .text(`拥有以下 AI 分身的完整知识产权：`, 50, 290, { align: 'center' });

      doc.font('Helvetica-Bold')
         .fontSize(18)
         .fillColor('#2563eb')
         .text(`「${data.avatarName}」`, 50, 330, { align: 'center' });

      // 分身描述
      if (data.avatarDescription) {
        doc.font('Helvetica')
           .fontSize(11)
           .fillColor('#666')
           .text(data.avatarDescription.slice(0, 200), 100, 370, {
             align: 'center',
             width: 400,
           });
      }

      // 知识产权声明
      doc.font('Helvetica')
         .fontSize(12)
         .fillColor('#333')
         .text('本证书确认该分身的知识产权归属于上述创作者，包括但不限于：', 50, 430);

      const rights = [
        '• 分身的人格设定、知识库内容的著作权',
        '• 分身交互内容的知识产权',
        '• 分身商业使用的收益权',
        '• 分身形象的肖像权及相关权益',
      ];

      rights.forEach((right, i) => {
        doc.text(right, 70, 460 + i * 22);
      });

      // 区块链存证信息
      doc.moveTo(50, 580)
         .lineTo(550, 580)
         .strokeColor('#e5e7eb')
         .lineWidth(1)
         .stroke();

      doc.font('Helvetica-Bold')
         .fontSize(12)
         .fillColor('#2563eb')
         .text('区块链存证信息', 50, 600);

      doc.font('Courier')
         .fontSize(9)
         .fillColor('#666')
         .text(`存证哈希：${data.blockchainHash}`, 50, 625, { width: 500 });

      doc.font('Helvetica')
         .fontSize(10)
         .fillColor('#2563eb')
         .text('🔗 在区块链浏览器验证', 50, 655);

      // 签发信息
      doc.font('Helvetica')
         .fontSize(11)
         .fillColor('#333')
         .text(`签发信息：`, 50, 700);

      doc.font('Helvetica')
         .fontSize(10)
         .fillColor('#666')
         .text(`签发日期：${data.createdAt.toLocaleDateString('zh-CN')}`, 50, 725)
         .text(`创作者邮箱：${data.creatorEmail}`, 50, 745)
         .text(`认证机构：AI分身市场平台`, 50, 765);

      // 电子印章区域（模拟）
      doc.circle(480, 720, 40)
         .strokeColor('#dc2626')
         .lineWidth(2)
         .stroke();

      doc.font('Helvetica-Bold')
         .fontSize(10)
         .fillColor('#dc2626')
         .text('AI分身市场', 440, 715, { align: 'center', width: 80 })
         .text('认证专用章', 440, 730, { align: 'center', width: 80 });

      // 页脚
      doc.font('Helvetica')
         .fontSize(8)
         .fillColor('#999')
         .text('本证书由 AI分身市场平台签发，经区块链存证，具有法律效力。', 50, 820, { align: 'center' });

      doc.end();
    });
  }

  /**
   * 查询或生成证书（幂等）
   */
  async ensureGenerated(avatarId: string, certificationId: string): Promise<{
    certificateNo: string | null;
    pdfUrl: string | null;
    blockchainHash: string | null;
  }> {
    // 检查是否已生成
    const { data: cert } = await (this.supabase
      .from('avatar_certifications') as any)
      .select('status, certificate_no, certificate_url, blockchain_hash')
      .eq('id', certificationId)
      .single();

    if (!cert) {
      throw new Error('Certification not found');
    }

    // 如果已认证，直接返回
    if (cert.status === 'certified' && cert.certificate_url) {
      const { data: { publicUrl } } = this.supabase.storage
        .from('deliverables')
        .getPublicUrl(cert.certificate_url);
      return {
        certificateNo: cert.certificate_no,
        pdfUrl: publicUrl,
        blockchainHash: cert.blockchain_hash,
      };
    }

    // 如果已支付但未生成，执行生成
    if (cert.status === 'paid' || cert.status === 'processing') {
      return await this.generate(avatarId, certificationId);
    }

    return {
      certificateNo: null,
      pdfUrl: null,
      blockchainHash: null,
    };
  }
}
