import { Router, raw } from 'express';
import { requireSession, requireSessionOrApiKey } from '../middleware/sessionAuth.js';
import { register } from '../controllers/registerController.js';
import { claimByApiKey } from '../controllers/claimController.js';
import { resetPassword } from '../controllers/resetPasswordController.js';
import { login } from '../controllers/loginController.js';
import { logout } from '../controllers/logoutController.js';
import { getDashboard, updateDashboardEmail, updateDashboardPassword } from '../controllers/dashboardController.js';
import { downloadBackup, listBackups, uploadBackup } from '../controllers/backupController.js';

const router = Router();

router.post('/register', register);
router.post('/claim', claimByApiKey);
router.post('/reset-password', resetPassword);
router.post('/login', login);
router.post('/logout', logout);
router.get('/dashboard', requireSession, getDashboard);
router.get('/list', requireSessionOrApiKey, listBackups);
router.post('/upload', requireSessionOrApiKey, raw({ type: '*/*', limit: '100mb' }), uploadBackup);
router.get('/download/:file_id', requireSessionOrApiKey, downloadBackup);
router.post('/dashboard/account/email', requireSession, updateDashboardEmail);
router.post('/dashboard/account/password', requireSession, updateDashboardPassword);

export default router;
