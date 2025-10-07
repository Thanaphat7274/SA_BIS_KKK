import React,{useState} from "react";

// ข้อมูลคะแนน
  const scores = [
    { level: "ดีมาก", desc: "ผลการปฏิบัติงานอยู่ในเกณฑ์ดีเยี่ยม สามารถปฏิบัติงานได้เกินกว่าระดับมาตรฐานอยู่เสมอ", score: 5 },
    { level: "ดี", desc: "ผลการปฏิบัติงานอยู่ในเกณฑ์ดี สามารถปฏิบัติงานได้เกินกว่าระดับมาตรฐานเป็นครั้งคราว", score: 4 },
    { level: "ปานกลาง", desc: "ผลการปฏิบัติงานอยู่ในเกณฑ์ปานกลาง สามารถปฏิบัติงานได้ในระดับมาตรฐานที่กำหนด", score: 3 },
    { level: "ต้องปรับปรุง", desc: "ผลการปฏิบัติงานอยู่ในเกณฑ์ต้องปรับปรุง การปฏิบัติงานอยู่ในเกณฑ์ต่ำกว่าระดับมาตรฐาน", score: 2 },
    { level: "ต้องแก้ไขโดยด่วน", desc: "ผลการปฏิบัติงานอยู่ในเกณฑ์ต้องปรับปรุงแก้ไขโดยด่วน การปฏิบัติงานอยู่ในเกณฑ์ต่ำกว่าระดับมาตรฐานมาก", score: 1 },
  ];
  // ข้อมูลเกณฑ์การประเมิน
  const evaluationCriteria = [
    {
      id: 'quality',
      title: 'คุณภาพและความสำเร็จของงาน',
      description: 'ความสามารถในการทำงานให้สำเร็จตามเป้าหมาย มีคุณภาพสูง สามารถแก้ปัญหาและสื่อสารอย่างชัดเจน'
    },
    {
      id: 'skill',
      title: 'ทักษะและความเชี่ยวชาญ',
      description: 'มีความรู้และความสามารถเฉพาะทางในงานที่รับผิดชอบ สามารถนำความรู้มาประยุกต์ใช้ได้อย่างมีประสิทธิภาพ'
    },
    {
      id: 'teamwork',
      title: 'การทำงานเป็นทีม',
      description: 'สามารถทำงานร่วมกับผู้อื่นได้ดี มีความร่วมมือและช่วยเหลือเพื่อนร่วมงาน'
    },
    {
      id: 'problem_solving',
      title: 'การแก้ปัญหา',
      description: 'สามารถวิเคราะห์และแก้ไขปัญหาต่างๆ ที่เกิดขึ้นในการทำงานได้อย่างมีประสิทธิภาพ'
    },
    {
      id: 'initiative',
      title: 'ความคิดริเริ่ม',
      description: 'มีความคิดสร้างสรรค์ กล้าเสนอความคิดเห็นและแนวทางใหม่ๆ เพื่อปรับปรุงการทำงาน'
    },
    {
      id: 'management',
      title: 'การจัดการงาน',
      description: 'สามารถจัดการเวลา ลำดับความสำคัญของงาน และทรัพยากรได้อย่างมีประสิทธิภาพ'
    },
    {
      id: 'responsibility',
      title: 'ความรับผิดชอบ',
      description: 'มีความรับผิดชอบต่อหน้าที่ ตรงต่อเวลา และสามารถทำงานให้สำเร็จตามที่มอบหมาย'
    }
  ];

    
const Form2 = ({ onSummaryChange }) => {
     // รับข้อมูลพนักงานและตำแหน่งจาก state
   const [evaluationScores, setEvaluationScores] = useState({});

   // สร้าง state สำหรับเก็บคะแนนการประเมิน
  const handleScoreChange = (criteriaId, score) => {
    setEvaluationScores({
      ...evaluationScores,
      [criteriaId]: score
    });
  };

    // เพิ่ม function คำนวณคะแนนเฉลี่ย สรุปผล
const calculateAverage = () => {
    const values = Object.values(evaluationScores);
    if (values.length === 0) return '0.00';
    const sum = values.reduce((acc, val) => acc + val, 0);
    return (sum / values.length).toFixed(2);
  };

  // รายงานสรุปให้พาเรนต์ (ถ้ามี) เมื่อคะแนนเปลี่ยนแปลง
  React.useEffect(() => {
    if (typeof onSummaryChange === 'function') {
      onSummaryChange({
        evaluatedCount: Object.keys(evaluationScores).length,
        total: evaluationCriteria.length,
        average: calculateAverage(),
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [evaluationScores]);


    return (
        <div>
            <h2 className="text-2xl font-bold mb-4 text-center text-gray-800">
          ส่วนที่ 2 คะแนนผลงานตามตัวชี้วัด (Performance Goal / KPI)
        </h2>

        <div className="text-gray-700 text-sm mb-4 leading-relaxed">
          <p>1. ประเมินความสามารถในการปฏิบัติงาน (KPI) โดยให้คะแนน 1 - 5 ตามระดับความสามารถของพนักงานดังคำอธิบายข้างล่าง</p>
          <p>2. ให้ประเมินความสามารถของพนักงานเฉพาะช่วงระยะเวลาที่กำหนดไว้ข้างต้น</p>
          <p>3. ให้พิจารณาทีละหัวข้อโดยไม่นำหัวข้ออื่นมาเกี่ยวโยงกัน</p>
        </div>

        {/* ตารางคะแนน */}
        <div className="overflow-x-auto mb-8">
          <table className="w-full border-collapse text-center text-sm">
            <thead className="bg-gray-200 font-semibold">
              <tr>
                <th className="border border-gray-400 px-3 py-2 w-1/6">ระดับคะแนน</th>
                <th className="border border-gray-400 px-3 py-2">คำอธิบาย</th>
                <th className="border border-gray-400 px-3 py-2 w-1/12">คะแนน</th>
              </tr>
            </thead>
            <tbody>
              {scores.map((row, index) => (
                <tr key={index} className="hover:bg-gray-50">
                  <td className="border border-gray-400 px-2 py-2">{row.level}</td>
                  <td className="border border-gray-400 text-left px-3 py-2">{row.desc}</td>
                  <td className="border border-gray-400 px-2 py-2 font-semibold">{row.score}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Evaluation Criteria */}
        <div className="space-y-6 mt-8">
          {evaluationCriteria.map((criteria, index) => (
            <div key={criteria.id} className="border-b border-gray-200 pb-6">
              <h3 className="font-semibold text-gray-800 mb-2">
                {index + 1}. {criteria.title}
              </h3>
              <p className="text-sm text-gray-600 mb-4 leading-relaxed">
                {criteria.description}
              </p>

              {/* Rating Scale */}
              <div className="flex items-center gap-4 flex-wrap">
                <span className="text-sm text-gray-600 font-medium">คะแนน:</span>
                <div className="flex items-center gap-3">
                  {[1, 2, 3, 4, 5].map((score) => (
                    <button
                      key={score}
                      onClick={() => handleScoreChange(criteria.id, score)}
                      className={`w-10 h-10 rounded-full border-2 flex items-center justify-center font-semibold transition-all
                        ${evaluationScores[criteria.id] === score 
                          ? 'bg-blue-500 border-blue-500 text-white scale-110' 
                          : 'border-gray-300 text-gray-600 hover:border-blue-400 hover:bg-blue-50'
                        }`}
                    >
                      {score}
                    </button>
                  ))}
                </div>
                <span className="text-sm text-gray-500 ml-2">
                  {evaluationScores[criteria.id] ? `เลือกแล้ว: ${evaluationScores[criteria.id]}` : 'ยังไม่เลือก'}
                </span>
              </div>
            </div>
          ))}
        </div>
        </div>
    );
};
export default Form2;