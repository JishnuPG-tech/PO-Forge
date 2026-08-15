import pytest
from backend.app.services.corpus_intelligence.miner import CorpusIntelligenceEngine
from backend.app.services.question_generation_engine.generator import QuestionGenerationEngine
from backend.app.services.ai_agent.hermes_coach import HermesAICoach

def test_full_corpus_mining_and_template_extraction():
    engine = CorpusIntelligenceEngine()
    templates = engine.mine_templates_from_questions(subject_code="QUANT", topic_code="PROFIT_LOSS")
    assert len(templates) > 0
    tpl = templates[0]
    assert tpl["template_code"] == "TPL_QUANT_PROFIT_LOSS_DISCOUNT_TRAP_001"
    assert "markup_pct" in tpl["numeric_param_ranges_json"]
    assert len(tpl["distractor_patterns_json"]) >= 3

def test_full_question_generation_verification_publish_cycle():
    gen_engine = QuestionGenerationEngine()
    res = gen_engine.generate_verified_questions(
        subject_code="QUANT",
        topic_code="PROFIT_LOSS",
        template_id="TPL_QUANT_PROFIT_LOSS_DISCOUNT_TRAP_001",
        difficulty="MEDIUM",
        count=1
    )
    assert res["status"] == "SUCCESS"
    assert res["generated_count"] == 1
    q = res["questions"][0]
    assert q["verification_passed"] is True
    assert len(q["options"]) == 5
    assert q["correct_option_index"] == 2

def test_hermes_coach_generates_verified_questions_via_tool():
    coach = HermesAICoach()
    res = coach.process_chat_request(
        user_id="USR_TEST_STUDENT_001",
        user_message="Generate 2 verified practice questions on Profit & Loss"
    )
    assert "response" in res
    assert len(res["tool_calls"]) > 0
    t_call = res["tool_calls"][0]
    assert t_call["tool_name"] == "generate_practice_question"
    assert t_call["result"]["status"] == "SUCCESS"
    assert len(t_call["result"]["data"]["questions"]) == 2

if __name__ == "__main__":
    pytest.main(["-v", __file__])
