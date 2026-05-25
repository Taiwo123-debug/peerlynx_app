import { defineConfig } from 'vite';
import path from 'path';

export default defineConfig({
  server: {
    host: true,
    port: 5173
  },

  build: {
    rollupOptions: {

      input: {
        main: path.resolve(__dirname, 'index.html'),
        about_peerlynx: path.resolve(__dirname, 'about-peerlynx.html'),
        account_security: path.resolve(__dirname, 'account-security.html'),
        carousel: path.resolve(__dirname, 'carousel.html'),
        category: path.resolve(__dirname, 'category.html'),
        chat_profile: path.resolve(__dirname, 'chat-profile.html'),
        chat: path.resolve(__dirname, 'chat.html'),
        choose_school: path.resolve(__dirname, 'choose-school.html'),
        delete_account: path.resolve(__dirname, 'delete-account.html'),
        edit_profile: path.resolve(__dirname, 'edit-profile.html'),
        forgot_password: path.resolve(__dirname, 'forgot-password.html'),
        messenger: path.resolve(__dirname, 'messenger.html'),
        new_skill: path.resolve(__dirname, 'new-skill.html'),
        offers: path.resolve(__dirname, 'offers.html'),
        otp_login: path.resolve(__dirname, 'otp-login.html'),
        profile: path.resolve(__dirname, 'profile.html'),
        sign_in: path.resolve(__dirname, 'sign-in.html'),
        sign_up: path.resolve(__dirname, 'sign-up.html'),
        skill_preview: path.resolve(__dirname, 'skill-preview.html'),
        skill: path.resolve(__dirname, 'skill.html'),
        student_home: path.resolve(__dirname, 'student-home.html'),
        support_us: path.resolve(__dirname, 'support-us.html'),
        tutor_home: path.resolve(__dirname, 'tutor-home.html'),
        tutor_skills: path.resolve(__dirname, 'tutor-skills.html'),
        user_type: path.resolve(__dirname, 'user-type.html'),
        view_skills: path.resolve(__dirname, 'view-skills.html'),
        view_students: path.resolve(__dirname, 'view-students.html'),
        student_preview: path.resolve(__dirname, 'student-preview.html'),
        active_students: path.resolve(__dirname, 'active-students.html'),
        alumni: path.resolve(__dirname, 'alumni.html'),
        track_student_progress: path.resolve(__dirname, 'track-student-progress.html'),
        tutor_preview: path.resolve(__dirname, 'tutor-preview.html'),
        all_recommendations: path.resolve(__dirname, 'all-recommendations.html'),
        edit_skills: path.resolve(__dirname, 'edit-skills.html'),
        track_my_progress: path.resolve(__dirname, 'track-my-progress.html'),
        student_skills: path.resolve(__dirname, 'student-skills.html'),
        my_progress: path.resolve(__dirname, 'my-progress.html'),
      }
    }
  }
});