import { Router } from 'express';
import { recommendCard } from '../utils/cardOptimiser.js';

const router = Router();

router.get('/recommend', (req, res) => {
  const { category, isJTT } = req.query;
  res.json({ card: recommendCard(category, isJTT === 'true') });
});

export default router;
