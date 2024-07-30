const nodemailer = require('nodemailer');
const htmlToText = require('html-to-text');
const fs = require('fs').promises;
const path = require('path');

module.exports = class Email {
  constructor(user, url) {
    this.to = user.email;
    this.firstName = user.name.split(' ')[0];
    this.url = url;
    this.from = `App <${process.env.Email_FROM}>`;
    this.transporter = this.newTransport();
  }

  newTransport() {
    return nodemailer.createTransport({
      service: 'gmail',
      host: 'smtp.gmail.com',
      port: 587,
      auth: {
        user: process.env.EMAIL_USERNAME,
        pass: process.env.EMAIL_PASSWORD,
      },
    });
  }

  async sendReset(subject) {
    try {
      const htmlPath = path.join(__dirname, 'emailReset.html');
      let html = await fs.readFile(htmlPath, { encoding: 'utf-8' });

      html = this.replacePlaceholders(html, {
        firstName: this.firstName,
        url: this.url,
      });

      const mailOptions = {
        from: this.from,
        to: this.to,
        subject,
        html,
        text: htmlToText.convert(html),
      };

      await this.transporter.sendMail(mailOptions);
      // const info = await this.transporter.sendMail(mailOptions);
      // console.log('Emailsent:', info.response);
    } catch (error) {
      // console.log('Error sending email:', error);
      throw new Error('Error sending email. Please try again');
    }
  }

  async sendVerify(subject) {
    try {
      const htmlPath = path.join(__dirname, 'emailVerify.html');
      let html = await fs.readFile(htmlPath, { encoding: 'utf-8' });

      html = this.replacePlaceholders(html, {
        firstName: this.firstName,
        url: this.url,
      });

      const mailOptions = {
        from: this.from,
        to: this.to,
        subject,
        html,
        text: htmlToText.convert(html),
      };

      await this.transporter.sendMail(mailOptions);
      // const info = await this.transporter.sendMail(mailOptions);
      // console.log('Emailsent:', info.response);
    } catch (error) {
      // console.log('Error sending email:', error);
      throw new Error('Error sending email. Please try again');
    }
  }

  async sendPasswordReset() {
    await this.sendReset('Your password reset token is valid for 10 minutes');
  }

  async sendVerificationEmail() {
    await this.sendVerify('Your verification token is valid for 10 minutes');
  }

  replacePlaceholders(template, variables) {
    return template.replace(/{{\s*(\w+)\s*}}/g, (match, key) => {
      return variables[key] || '';
    });
  }
};
// const nodemailer = require('nodemailer');
// const htmlToText = require('html-to-text');
// const fs = require('fs').promises;
// const path = require('path');

// module.exports = class Email {
//   constructor(user, url) {
//     this.to = user.email;
//     this.firstName = user.name.split(' ')[0];
//     this.url = url;
//     this.from = `App <${process.env.Email_FROM}>`;
//     this.transporter = this.newTransport();
//   }

//   newTransport() {
//     return nodemailer.createTransport({
//       service: 'gmail',
//       host: 'smtp.gmail.com',
//       port: 587,
//       auth: {
//         user: process.env.EMAIL_USERNAME,
//         pass: process.env.EMAIL_PASSWORD,
//       },
//     });
//   }

//   async sendReset(subject) {
//     try {
//       const htmlPath = path.join(__dirname, 'email.html');
//       let html = await fs.readFile(htmlPath, { encoding: 'utf-8' });

//       html = this.replacePlaceholders(html, {
//         firstName: this.firstName,
//         url: this.url,
//       });

//       const mailOptions = {
//         from: this.from,
//         to: this.to,
//         subject,
//         html,
//         text: htmlToText.convert(html),
//       };

//       await this.transporter.sendMail(mailOptions);
//       // const info = await this.transporter.sendMail(mailOptions);
//       // console.log('Emailsent:', info.response);
//     } catch (error) {
//       // console.log('Error sending email:', error);
//       throw new Error('Error sending email. Please try again');
//     }
//   }

//   async sendPasswordReset() {
//     await this.sendReset('Your password reset token is valid for 10 minutes');
//   }

//   async sendVerificationEmail() {
//     await this.send('Your verification token is valid for 10 minutes');
//   }

//   replacePlaceholders(template, variables) {
//     return template.replace(/{{\s*(\w+)\s*}}/g, (match, key) => {
//       return variables[key] || '';
//     });
//   }
// };
