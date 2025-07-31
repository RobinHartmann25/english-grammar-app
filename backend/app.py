#Diese Datei wurde mit Unterstützung von ChatGPT erstellt, da keine Kenntnisse in Python vorher vorlagen.
from datetime import datetime
from flask import Flask, request, jsonify
from flask_cors import CORS
from openai import OpenAI
import os
from dotenv import load_dotenv
from pymongo import MongoClient



load_dotenv()

mongo_client = MongoClient("mongodb://localhost:27017/")
db = mongo_client["grammar_app"]

app = Flask(__name__)
CORS(app, origins=["http://127.0.0.1:4200", 'http://localhost:4200'])

client = OpenAI(api_key = os.getenv("OPENAI_API_KEY"))
#print("API-Key:", openai.api_key)

import re

def remove_filled_blanks(sentence):
    # Ersetzt Inhalte wie "_ had already practiced _" durch "_______"
    return re.sub(r'_+[^_]+_+', '_______', sentence)


@app.route('/generate', methods=['POST'])
def generate():
    data = request.json
    topic = data.get("topic")
    grammar = data.get("grammar")
    level = data.get("level")

    print(f'Topic: {topic}, Grammar: {grammar}, Level: {level}')

    prompt = f"""
    You are a helpful English grammar teacher.

    Please create exactly 5 grammatically correct and error-free English gap-fill sentences for learners at the {level} proficiency level (A1, A2, or B1).
    The sentences should focus on the grammar point: "{grammar}" and be about the topic: "{topic}".

    Requirements:
    - Use simple and appropriate vocabulary for the specified level.
    - Each sentence should contain exactly one blank, represented by underscores (_) where the learner has to fill in the missing word or phrase.
    - Do not provide the answers or solutions.
    - Keep sentences clear, concise, and suitable for short learning sessions.
    - Make sure all sentences strictly follow the grammar rules and are suitable for learners at this level.
    - Avoid overly complex structures or ambiguous wording.
    - The sentences should encourage learning and practice of the specified grammar point.

    Respond only with the 5 sentences, each on a new line, without additional explanation or numbering.
    """

    try:
        response = client.chat.completions.create(
            model="gpt-4.1-mini",  # oder "gpt-3.5-turbo" je nach API-Version
            messages=[
                {"role": "system", "content": "You are a helpful English grammar teacher."},
                {"role": "user", "content": prompt}
            ],
            max_tokens=300,
            temperature=0.5,
            n=1,
            stop=None
        )
        text = response.choices[0].message.content.strip()
        sentences = text.split("\n")
        sentences = [remove_filled_blanks(s.strip()) for s in sentences]

        print("logging")
        db.generate_logs.insert_one({
            "timestamp": datetime.now(),
            "input": { "topic": topic, "grammar": grammar, "level": level },
            "openai_prompt": prompt,
            "openai_response": sentences
        })

        print(sentences);
        return jsonify({"sentences": sentences})

    except Exception as e:
        return jsonify({"error": str(e)}), 500
    
    
@app.route('/hint', methods=['POST'])
def getHint():
    data = request.get_json()
    sentence = data.get('sentence', '')

    if not sentence:
        return jsonify({'error': 'Kein Satz übergeben'}), 400
    
    prompt = (
        f"Gib eine strukturierte Hilfestellung für folgenden Lückentext:\n\n"
        f"\"{sentence}\"\n\n"
        f"- Gib **keine** Lösung an.\n"
        f"- Verwende maximal 2 kurze Sätze.\n"
        f"- Falls möglich, gib allgemeine Tipps zur Grammatik.\n"
        f"- Falls ein unregelmäßiges Verb zu verwenden ist, erwähne dies (ohne das Verb zu nennen).\n\n"
        f"Antwort (nur der Hinweistext):"
    )

    try:
        response = client.chat.completions.create(
            model="gpt-4.1-mini",  # oder "gpt-3.5-turbo" je nach API-Version
            messages=[
                {"role": "user", "content": prompt}
            ],
            max_tokens=100,
            temperature=0.5,
            n=1,
            stop=None
        )
        hint = response.choices[0].message.content.strip()

        print("logging")
        db.hint_logs.insert_one({
            "timestamp": datetime.now(),
            "input_sentence": sentence,
            "openai_prompt": prompt,
            "openai_response": hint
        })

        return jsonify({'hint': hint})
    except Exception as e:
        print(e)
        return jsonify({'error': 'Fehler der Hilfestellung'}), 500
    

@app.route('/getFeedback', methods=['POST'])
def getFeeback():
    data = request.get_json()
    exercises = data.get('exercises', [])
    answers = data.get('answers', [])
    feedbacks = []
    feedback_documents = []

    for ex, ans in zip(exercises, answers):
        prompt = (
        f"Bewerte folgenden Satz und die Antwort eines Lernenden:\n\n"
        f"Satz: {ex}\nAntwort: {ans}\n\n"
        f"Gib folgendes zurück:\n"
        f"1. **Korrekt oder falsch?** (max. 1 Satz)\n"
        f"2. **Begründung oder Verbesserungsvorschlag**, falls nötig (max. 1–2 Sätze).\n\n"
        f"Format:\n"
        f"Korrektheit: ...\n"
        f"Hinweis: ..."
    )


        try:
            response = client.chat.completions.create(
                model="gpt-4o",
                messages=[
                    {"role": "system", "content": "Du bist ein hilfsbereiter Englischlehrer."},
                    {"role": "user", "content": prompt}
                ]
            )
            feedback_text = response.choices[0].message.content.strip()
        except Exception as e:
            feedback_text = f"Fehler bei Bewertung: {str(e)}"

        feedbacks.append(feedback_text)
        feedback_documents.append({
            "exercise": ex,
            "answer": ans,
            "openai_prompt": prompt,
            "openai_response": feedback_text
        })
        
        print("logging")
        db.feedback_logs.insert_one({
            "timestamp": datetime.now(),
            "input": {
                "exercises": exercises,
                "answers": answers
            },
            "feedbacks": feedback_documents
         })

    return jsonify({'feedbacks': feedbacks})
    

if __name__ == '__main__':
    app.run(debug=True)
