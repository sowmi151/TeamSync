"""
TeamSync — Unit Tests for Python Matching Algorithm and SQLite Database
Run via: python test_algorithm.py
"""

import unittest
import matching_algorithm as ma
import database

class TestTeamSyncMatching(unittest.TestCase):
    def setUp(self):
        database.init_database()

    def test_database_loaded_52_accounts(self):
        stats = database.get_stats()
        self.assertEqual(stats["totalAccounts"], 52, "Database must load 52 verified student accounts")
        self.assertEqual(stats["universitiesCount"], 14, "Database must load 14 top universities")

    def test_student_retrieval_and_filtering(self):
        students = database.get_students()
        self.assertEqual(len(students), 52)
        stanford_students = database.get_students(university_id="univ-stanford")
        self.assertGreater(len(stanford_students), 0)

    def test_authentication(self):
        user = database.authenticate("rahul.s@stanford.edu", "Password123!")
        self.assertIsNotNone(user)
        self.assertEqual(user["email"], "rahul.s@stanford.edu")

    def test_perfect_complementary_matching(self):
        # Frontend + Backend complementary synergy test
        student_frontend = {
            "id": "s_front",
            "skills": [{"name": "React", "proficiency": 90}],
            "roles": ["Frontend Developer"],
            "interests": ["Full Stack Web", "AI"],
            "availability": {"hoursPerWeek": 15, "preferences": ["Weekends"]},
            "experience": "Advanced"
        }
        student_backend = {
            "id": "s_back",
            "skills": [{"name": "Node.js", "proficiency": 88}],
            "roles": ["Backend Developer"],
            "interests": ["Full Stack Web", "AI"],
            "availability": {"hoursPerWeek": 15, "preferences": ["Weekends"]},
            "experience": "Advanced"
        }

        match = ma.calculate_student_match(student_frontend, student_backend)
        self.assertGreater(match["overallScore"], 50)
        self.assertEqual(match["confidenceLabel"], "High confidence")
        self.assertIn("role", match["factors"])
        self.assertTrue(match["factors"]["role"]["isValid"])

    def test_missing_data_weight_redistribution(self):
        # Student with missing availability & experience
        student_incomplete = {
            "id": "s_inc",
            "skills": [{"name": "Python", "proficiency": 90}],
            "roles": ["Data Scientist"],
            "interests": ["AI"]
            # No availability, no experience
        }
        student_complete = {
            "id": "s_comp",
            "skills": [{"name": "Python", "proficiency": 85}],
            "roles": ["Data Scientist"],
            "interests": ["AI"],
            "availability": {"hoursPerWeek": 20, "preferences": ["Weekdays"]},
            "experience": "Intermediate"
        }

        match = ma.calculate_student_match(student_incomplete, student_complete)
        # Factor availability should not be valid
        self.assertFalse(match["factors"]["availability"]["isValid"])
        # Factor experience should not be valid
        self.assertFalse(match["factors"]["experience"]["isValid"])
        # Valid factors should have redistributed weights summing to ~1.0
        valid_eff_weights = sum(f["effectiveWeight"] for f in match["factors"].values() if f["isValid"])
        self.assertAlmostEqual(valid_eff_weights, 1.0, places=2)

if __name__ == "__main__":
    unittest.main()
