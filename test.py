from unittest import TestCase
from app import app
from flask import session, json
from boggle import Boggle


class FlaskTests(TestCase):

    def setUp(self):
        """Testing before every test."""
        app.config['TESTING'] = True

    def test_home(self):
        """Test requests to flask via client"""
        with app.test_client() as client:
            res = client.get('/')
            self.assertIn('board', session)
            self.assertIsNone(session.get('highscore'))
            self.assertIsNone(session.get('played'))
            self.assertEqual(res.status_code, 200)
            self.assertIn(b'HIGHEST SCORE:', res.data)
            self.assertIn(b'NUMBER OF TIMES PLAYED:', res.data)

    def test_word_validity(self):
        """Test check-validity route for valid guess"""
        with app.test_client() as client:
            with client.session_transaction() as sess:
                sess['board'] = [["T", "E", "S", "T"], 
                                 ["T", "E", "S", "T"], 
                                 ["T", "E", "S", "T"], 
                                 ["T", "E", "S", "T"]]
        res = client.get('/check-validity?guess=test')
        self.assertEqual(res.status_code, 200)
        self.assertEqual(res.json['result'], 'ok')

    def test_total_score(self):
        """Test total-score function response"""
        with app.test_client() as client:
            res = client.post('/total-score', data=json.dumps({'score': 10}), content_type='application/json')
            self.assertEqual(res.status_code, 200)
            self.assertIs(res.json['highestScore'], True)
