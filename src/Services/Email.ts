import nodemailer from 'nodemailer';

/** Service for work with Email */
class EmailService {

  /** Instance of a transporter */
  transporter: nodemailer.Transporter

  constructor() {
    setTimeout(() => {
      this.transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
          user: process.env.SMTP_USER,
          pass: process.env.SMTP_PASSWORD 
        }
      })
    }, 0)
  }

  /**
   * Method to send account activation email
   * @param {string} to email receiver
   * @param {string} link activation link
   */
  async sendActivationMail(to: string, link: string) {
    await this.transporter.sendMail({
      from: process.env.SMTP_USER,
      to,
      subject: 'Активация аккаунта на ' + process.env.API_URL,
      text: '',
      html: 
          `
          <div>
            <h1>Для активации аккаунта перейдите по ссылке:</h1></br>
            <a href="${link}">${link}</a>
          </div>

          `
    })
  }

  async sendWorkspaceInvitationMail(to: string, link: string, workspaceName: string) {
    await this.transporter.sendMail({
      from: process.env.SMTP_USER,
      to,
      subject: 'Активация аккаунта на ' + process.env.API_URL,
      text: '',
      html: 
          `
          <div>
            <h1>Для присоединения к рабочему "${workspaceName}" пространству перейдите по ссылке:</h1></br>
            <a href="${link}">${link}</a>
          </div>

          `
    })
  }
}

export default new EmailService()