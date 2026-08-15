from backend.app.core.database import SessionLocal
from backend.app.models.content import Exam, ExamSection, Subject, Topic, Subtopic

def seed_taxonomy(db_session=None):
    db = db_session if db_session is not None else SessionLocal()
    close_db = db_session is None
    try:
        print("[SEED] Seeding Banking Exam Taxonomy...")

        # 1. Seed Exams
        exams_data = [
            {"code": "IBPS_RRB_PO", "name": "IBPS RRB Officer Scale I (PO)", "description": "Regional Rural Banks Officer Scale I Examination"},
            {"code": "IBPS_PO", "name": "IBPS Probationary Officer (PO)", "description": "Institute of Banking Personnel Selection PO Examination"},
            {"code": "SBI_PO", "name": "SBI Probationary Officer (PO)", "description": "State Bank of India PO Examination"},
            {"code": "SBI_CLERK", "name": "SBI Junior Associate (Clerk)", "description": "State Bank of India Clerk Examination"},
            {"code": "RBI_ASSISTANT", "name": "RBI Assistant", "description": "Reserve Bank of India Assistant Examination"}
        ]

        exam_objects = {}
        for ed in exams_data:
            exam = db.query(Exam).filter_by(code=ed["code"]).first()
            if not exam:
                exam = Exam(**ed)
                db.add(exam)
                db.flush()
            exam_objects[ed["code"]] = exam

        # Seed Exam Sections for IBPS RRB PO Prelims
        rrb_po = exam_objects.get("IBPS_RRB_PO")
        if rrb_po:
            existing_sections = db.query(ExamSection).filter_by(exam_id=rrb_po.id).count()
            if existing_sections == 0:
                db.add(ExamSection(exam_id=rrb_po.id, name="Reasoning Ability", section_order=1, duration_minutes=22, total_questions=40))
                db.add(ExamSection(exam_id=rrb_po.id, name="Quantitative Aptitude", section_order=2, duration_minutes=23, total_questions=40))

        # 2. Seed Subjects
        subjects_data = [
            {"code": "QUANT", "name": "Quantitative Aptitude", "description": "Numerical Ability & Quantitative Analysis", "display_order": 1},
            {"code": "REASONING", "name": "Reasoning Ability", "description": "Logical & Analytical Reasoning", "display_order": 2},
            {"code": "ENGLISH", "name": "English Language", "description": "Grammar, Vocabulary & Comprehension", "display_order": 3},
            {"code": "GA_BANKING", "name": "General & Banking Awareness", "description": "Banking Terms, Financial Awareness & Current Affairs", "display_order": 4},
            {"code": "COMPUTER", "name": "Computer Knowledge", "description": "Computer Fundamentals & Networking", "display_order": 5}
        ]

        subject_objects = {}
        for sd in subjects_data:
            subj = db.query(Subject).filter_by(code=sd["code"]).first()
            if not subj:
                subj = Subject(**sd)
                db.add(subj)
                db.flush()
            subject_objects[sd["code"]] = subj

        # 3. Seed Topics & Subtopics
        taxonomy_hierarchy = {
            "QUANT": [
                {
                    "code": "SIMPLIFICATION", "name": "Simplification & Approximation",
                    "subtopics": [
                        {"code": "BODMAS_RULES", "name": "BODMAS Rules & Order of Operations"},
                        {"code": "SQUARES_CUBES_INDICES", "name": "Squares, Cubes & Surds/Indices"},
                        {"code": "APPROXIMATION_TRICKS", "name": "Fast Estimation & Approximation"}
                    ]
                },
                {
                    "code": "NUMBER_SERIES", "name": "Number Series",
                    "subtopics": [
                        {"code": "MISSING_NUMBER_SERIES", "name": "Missing Number Series Patterns"},
                        {"code": "WRONG_NUMBER_SERIES", "name": "Wrong Number Series Detection"}
                    ]
                },
                {
                    "code": "QUADRATIC_EQUATIONS", "name": "Quadratic Equations",
                    "subtopics": [
                        {"code": "ROOT_COMPARISON", "name": "Two Variable Root Comparison (X vs Y)"},
                        {"code": "FACTORIZATION_TRICKS", "name": "Fast Factorization & Sign Rules"}
                    ]
                },
                {
                    "code": "ARITHMETIC_PROBLEMS", "name": "Commercial Arithmetic",
                    "subtopics": [
                        {"code": "PERCENTAGES", "name": "Percentages & Fractional Equivalents"},
                        {"code": "RATIO_PROPORTION", "name": "Ratio, Proportion & Variation"},
                        {"code": "PROFIT_LOSS_DISCOUNT", "name": "Profit, Loss & Marked Price Discount"},
                        {"code": "SIMPLE_COMPOUND_INTEREST", "name": "Simple & Compound Interest Calculations"},
                        {"code": "TIME_WORK_PIPES", "name": "Time & Work, Pipes & Cisterns"},
                        {"code": "TIME_SPEED_DISTANCE", "name": "Speed, Distance, Trains & Boats/Streams"},
                        {"code": "MIXTURES_ALLIGATIONS", "name": "Mixtures & Alligation Rules"},
                        {"code": "AGES_PARTNERSHIP", "name": "Problems on Ages & Business Partnership"},
                        {"code": "AVERAGES", "name": "Averages & Weighted Mean"}
                    ]
                },
                {
                    "code": "DATA_INTERPRETATION", "name": "Data Interpretation (DI)",
                    "subtopics": [
                        {"code": "TABLE_DI", "name": "Tabular Data Interpretation"},
                        {"code": "BAR_GRAPH_DI", "name": "Bar Chart Data Interpretation"},
                        {"code": "LINE_GRAPH_DI", "name": "Line Graph Data Interpretation"},
                        {"code": "PIE_CHART_DI", "name": "Pie Chart (Single & Dual) DI"},
                        {"code": "CASELET_DI", "name": "Paragraph / Caselet DI"},
                        {"code": "RADAR_DI", "name": "Radar & Spider Web DI"},
                        {"code": "MISSING_DI", "name": "Missing Data Table DI"}
                    ]
                }
            ],
            "REASONING": [
                {
                    "code": "PUZZLES_SEATING", "name": "Puzzles & Seating Arrangement",
                    "subtopics": [
                        {"code": "CIRCULAR_SEATING", "name": "Circular & Polygonal Seating"},
                        {"code": "LINEAR_SEATING", "name": "Single & Parallel Line Seating"},
                        {"code": "BOX_PUZZLES", "name": "Box Stacking Puzzles"},
                        {"code": "FLOOR_FLAT_PUZZLES", "name": "Floor & Flat Based Puzzles"},
                        {"code": "DESIGNATION_PUZZLES", "name": "Hierarchy & Designation Puzzles"},
                        {"code": "DAY_MONTH_YEAR_PUZZLES", "name": "Calendar, Month & Date Puzzles"}
                    ]
                },
                {
                    "code": "SYLLOGISM", "name": "Syllogism",
                    "subtopics": [
                        {"code": "STANDARD_SYLLOGISM", "name": "Standard Syllogism (All, Some, No)"},
                        {"code": "ONLY_A_FEW_SYLLOGISM", "name": "Only a Few / Only Cases"},
                        {"code": "POSSIBILITY_CASES", "name": "Possibility & Either-Or Conclusions"}
                    ]
                },
                {
                    "code": "INEQUALITIES", "name": "Inequalities",
                    "subtopics": [
                        {"code": "DIRECT_INEQUALITIES", "name": "Statement Direct Inequalities"},
                        {"code": "CODED_INEQUALITIES", "name": "Symbol Coded Inequalities"}
                    ]
                },
                {
                    "code": "CODING_DECODING", "name": "Coding-Decoding",
                    "subtopics": [
                        {"code": "CHINESE_CODING", "name": "Substitutional / Chinese Coding"},
                        {"code": "NEW_PATTERN_CODING", "name": "Advanced Matrix / Symbol Coding"}
                    ]
                },
                {
                    "code": "BLOOD_RELATIONS", "name": "Blood Relations",
                    "subtopics": [
                        {"code": "FAMILY_TREE", "name": "Family Tree Puzzles"},
                        {"code": "CODED_BLOOD_RELATIONS", "name": "Coded Relationship Statements"}
                    ]
                },
                {
                    "code": "DIRECTION_SENSE", "name": "Direction & Distance",
                    "subtopics": [
                        {"code": "CARDINAL_DIRECTIONS", "name": "Cardinal & Angle Movement"},
                        {"code": "CODED_DIRECTIONS", "name": "Coded Distance & Direction"}
                    ]
                }
            ],
            "ENGLISH": [
                {
                    "code": "READING_COMPREHENSION", "name": "Reading Comprehension",
                    "subtopics": [
                        {"code": "FACTUAL_RC", "name": "Direct Fact & Detail Questions"},
                        {"code": "INFERENCE_BASED_RC", "name": "Author Tone & Inference Questions"},
                        {"code": "VOCABULARY_IN_CONTEXT", "name": "Contextual Synonyms & Antonyms"}
                    ]
                },
                {
                    "code": "CLOZE_TEST", "name": "Cloze Test",
                    "subtopics": [
                        {"code": "SINGLE_BLANK_CLOZE", "name": "Standard Passage Cloze Test"},
                        {"code": "GRAMMAR_BASED_CLOZE", "name": "Grammar & Collocation Cloze"}
                    ]
                },
                {
                    "code": "ERROR_SPOTTING", "name": "Error Spotting & Sentence Correction",
                    "subtopics": [
                        {"code": "SUBJECT_VERB_AGREEMENT", "name": "Subject-Verb Agreement Errors"},
                        {"code": "TENSES_MODALS", "name": "Tense & Modal Auxiliary Errors"},
                        {"code": "PREPOSITIONS_CONJUNCTIONS", "name": "Preposition & Conjunction Usage"}
                    ]
                },
                {
                    "code": "PARA_JUMBLES", "name": "Para Jumbles & Sentence Fit",
                    "subtopics": [
                        {"code": "FIVE_SENTENCE_PARA_JUMBLE", "name": "5-Sentence Ordering"},
                        {"code": "NEW_PATTERN_SENTENCE_FIT", "name": "Sentence Placement in Paragraph"}
                    ]
                }
            ],
            "GA_BANKING": [
                {
                    "code": "BANKING_AWARENESS", "name": "Banking & Financial Awareness",
                    "subtopics": [
                        {"code": "RBI_FUNCTIONS_MONETARY_POLICY", "name": "RBI Structure, Repo Rate & Monetary Policy"},
                        {"code": "TYPES_OF_ACCOUNTS_BANKING_TERMS", "name": "Nostro/Vostro, Casa & Banking Terms"},
                        {"code": "NPA_IBC_SARFAESI", "name": "Non-Performing Assets, IBC & SARFAESI Act"},
                        {"code": "DIGITAL_BANKING_UPI_NPCI", "name": "NPCI Products, UPI, NEFT, RTGS & CBDC"}
                    ]
                },
                {
                    "code": "CURRENT_AFFAIRS", "name": "National & International Current Affairs",
                    "subtopics": [
                        {"code": "GOVT_SCHEMES", "name": "Union Govt Schemes & Allocations"},
                        {"code": "SUMMITS_CONFERENCES", "name": "International Summits & G20/BRICS"},
                        {"code": "REPORTS_INDEXES", "name": "Global Indices & India Ranking"}
                    ]
                }
            ],
            "COMPUTER": [
                {
                    "code": "COMPUTER_HARDWARE_SOFTWARE", "name": "Computer Fundamentals",
                    "subtopics": [
                        {"code": "CPU_MEMORY_STORAGE", "name": "RAM, ROM, Cache & Secondary Storage"},
                        {"code": "OPERATING_SYSTEMS", "name": "Windows, Linux & Memory Management"}
                    ]
                },
                {
                    "code": "NETWORKING_CYBER", "name": "Networking & Cybersecurity",
                    "subtopics": [
                        {"code": "OSI_LAYERS_TOPOLOGIES", "name": "OSI Model, IP Addressing & Topologies"},
                        {"code": "CYBER_ATTACKS_MALWARE", "name": "Phishing, Ransomware & Firewalls"}
                    ]
                }
            ]
        }

        topic_count = 0
        subtopic_count = 0

        for subj_code, topics in taxonomy_hierarchy.items():
            subj_obj = subject_objects.get(subj_code)
            if not subj_obj:
                continue

            for t_idx, t_data in enumerate(topics, start=1):
                topic_obj = db.query(Topic).filter_by(subject_id=subj_obj.id, code=t_data["code"]).first()
                if not topic_obj:
                    topic_obj = Topic(
                        subject_id=subj_obj.id,
                        code=t_data["code"],
                        name=t_data["name"],
                        display_order=t_idx
                    )
                    db.add(topic_obj)
                    db.flush()
                topic_count += 1

                for st_idx, st_data in enumerate(t_data["subtopics"], start=1):
                    subtopic_obj = db.query(Subtopic).filter_by(topic_id=topic_obj.id, code=st_data["code"]).first()
                    if not subtopic_obj:
                        subtopic_obj = Subtopic(
                            topic_id=topic_obj.id,
                            code=st_data["code"],
                            name=st_data["name"],
                            display_order=st_idx
                        )
                        db.add(subtopic_obj)
                        db.flush()
                    subtopic_count += 1

        db.commit()
        print(f"[SUCCESS] Seeding complete! Added/Verified {len(exam_objects)} Exams, {len(subject_objects)} Subjects, {topic_count} Topics, {subtopic_count} Subtopics.")

    except Exception as e:
        db.rollback()
        print(f"[ERROR] Error seeding taxonomy: {e}")
        raise e
    finally:
        if close_db:
            db.close()

if __name__ == "__main__":
    seed_taxonomy()
