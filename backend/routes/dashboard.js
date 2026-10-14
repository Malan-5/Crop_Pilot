const express = require('express');
const router = express.Router();
const Scan = require('../models/Scan');
const Treatment = require('../models/Treatment');
const protect = require('../middleware/auth');

// This legacy router is not mounted; the active stats endpoint is /api/scan/stats.
router.get('/stats', protect, async (req, res) => {
  try {
    const userId = req.user.id;
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const sevenDaysOut = new Date(today.getTime() + 7 * 24 * 60 * 60 * 1000);

    const [cropsScanned, diseasesFound, treatments] = await Promise.all([
      Scan.countDocuments({ userId }),
      Scan.countDocuments({
        userId,
        diseaseDetected: { $exists: true, $nin: ['Healthy', '', null] },
      }),
      Treatment.find({ userId }).select('spraySchedule').lean(),
    ]);

    let upcomingSprays = 0;
    let treatmentsDone = 0;
    for (const treatment of treatments) {
      for (const spray of treatment.spraySchedule || []) {
        if (spray.status === 'done') {
          treatmentsDone += 1;
        } else if (spray.status === 'pending') {
          const sprayDate = new Date(spray.date);
          if (sprayDate >= today && sprayDate <= sevenDaysOut) upcomingSprays += 1;
        }
      }
    }

    res.json({ cropsScanned, diseasesFound, upcomingSprays, treatmentsDone });
  } catch {
    res.status(500).json({ error: 'Failed to load stats' });
  }
});

module.exports = router;
