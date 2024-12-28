import { PostResponseDto } from 'src/api/posts/dtos/responses/post.response.dto';
import { EReportStatus } from 'src/common/enums/report-status.enum';
import { Report } from 'src/repositories/entities';

export class ReportResponseDto {
  public id: string;
  public reason: string;
  public description: string;
  public status: EReportStatus;
  public name: string;
  public phone: string;
  public post?: PostResponseDto;

  constructor(report: Report) {
    this.id = report.id;
    this.reason = report.reason;
    this.description = report.description;
    this.status = report.status;
    this.name = report.name;
    this.phone = report.phone;
    if (report.post) {
      this.post = new PostResponseDto(report.post);
    }
  }
}
