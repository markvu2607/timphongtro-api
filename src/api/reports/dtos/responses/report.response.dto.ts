import { EReportStatus } from 'src/common/enums/report-status.enum';
import { Report } from 'src/repositories/entities';

export class ReportResponseDto {
  public id: string;
  public reason: string;
  public description: string;
  public status: EReportStatus;
  public name: string;
  public phone: string;
  public postId: string;

  constructor(report: Report) {
    this.id = report.id;
    this.reason = report.reason;
    this.description = report.description;
    this.status = report.status;
    this.name = report.name;
    this.phone = report.phone;
    this.postId = report.post.id;
  }
}
