import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const EvaluationForm = () => {
  const navigate = useNavigate();
  const [scores, setScores] = useState({});
 
  // ข้อมูลหัวข้อการประเมินตามรูป
  const evaluationData = [
    {
      id: 1,
      title: "1. ให้ความสำคัญกับคุณภาพผลงาน (Quality Focus)",
      subItems: [
        {
          id: "1.1",
          text: "ผลงานตามความเข้าใจถูกต้องและชัดเจน: ปฏิบัติงานตามความเข้าใจหรือแนวทางปฏิบัติงานที่ชัดเจนและนำเสนอได้ถูกต้อง และมีประสิทธิภาพ"
        },
        {
          id: "1.2",
          text: "สั่งสมงานความรู้ ติดตามอัพเดทของระบบ: งานความรู้ มีผลสั่งสมเอื้อเดือนกันในการปฏิบัติงาน หรือ ระบบอัพเดทงานไว้"
        },
        {
          id: "1.3",
          text: "ความละเอียดของรูปแบบและการตรวจสอบงานก่อนส่งมอบ: รายละเอียด แม้นยำ ไม่มีความผิดพลาดของงานส่งมอบมีประกัน"
        },
        {
          id: "1.4",
          text: "ตระหนักถึงผลสืบเนื่องของการงานผิดพลาดและหาแนวทางหรือน้ำตา: จากความผิดพลาดได้มีเครื่องมือป้องกันไม่ซ้ำกันได้"
        }
      ]
    },
    {
      id: 2,
      title: "2. แสดงความสามารถระดับคู่ 1 และตรวจสอบความถูกต้องของงานที่รับผิดชอบในโครงการและผลงานอ",
      subItems: [
        {
          id: "2.1",
          text: "ตรวจสอบความถูกต้องของงานมอบให้งานนั้นหลักเกณฑ์และพีดีเอฟงาน: การทำความดีตัวจับต้องต่างกัน"
        },
        {
          id: "2.2",
          text: "ปฏิบัติงานไม่ซ้ำป่ไปมีข้อผิดพลาดเดิมหรือเก็บผลงานที่ผิดพลาดอัดเกรนตืันเป็นว่า"
        },
        {
          id: "2.3",
          text: "ปฏิบัติงานโดยคำนึงการเทคนิคเเละเกร็งตรงตามคอนฟอม: ไม่ซ้ำป่างห้ามประสิทธิภาพ"
        }
      ]
    },
    {
      id: 3,
      title: "3. แสดงความสามารถระดับคู่ 2 และดูเเลความถูกต้องของงานระทิงหรือเเก้ไขเอกสารระบบงาน)",
      subItems: [
        {
          id: "3.1",
          text: "สั่งส่งกระบวนงานรอคอยงานมูลต้องงานเดาย์ หรือส่งองเดรกศรีในการลงงาน"
        },
        {
          id: "3.2",
          text: "ไม่อาม่วิมสดินชอบไนย่านงานกระคส่ง หมวนคคะสีกเดี้ยว"
        },
        {
          id: "3.3",
          text: "คำณานเชดต้องทำจักย์เป็นชัดเสื้นหดินดลตอนา การติคนจวะส่งในเมตอน"
        },
        {
          id: "3.4",
          text: "โต่งเเนนตามหด์อยโป่คูก่ยโมาดรัมนักลงกัน: เดตี่วควนค้องตำนเดินตอเเละมาตราตามกักทินอานดว"
        }
      ]
    },
    {
      id: 4,
      title: "4. แสดงความสามารถระดับคู่ 3 และงานเเมทักทิเกขระสอบส่มตรับในไลโนส้อมลระบบตอคุณภาพงาน",
      subItems: [
        {
          id: "4.1",
          text: "ปฏิทมอักสงครื่องสั่มปฏิบัติงานตอนกเทงาง: รามส่งใสคัดอินส่ไลงสั่มปฏิบัติงานไปช้คนานพออัดกระนางต้านการารานพอ"
        },
        {
          id: "4.2",
          text: "กำหาตนบาทยาง มาตรการ เเละตรวจสอบความกำหาบร้วท: ความตุคล้อง"
        },
        {
          id: "4.3",
          text: "วิเคราะห์ สาเหตุหลักเเลตงานเเละความเเสองทำงานริชัน: เพืมาหาทับงานกับนการอบเนมอลาจาป่างน"
        }
      ]
    },
    {
      id: 5,
      title: "5. แสดงความสามารถระดับคู่ 4 และสร้งรมมมล์รือคระบบการในงา หรือสมตรงาะเเพอาคุคณภาพของงานในบริษัท",
      subItems: [
        {
          id: "5.1",
          text: "สามารถชี้ประเดักจาระทตามบขึครตรวจสอบความก้านบใร่: ความสูกถอองเเอดมูคยมายบัในการปฏิบัติงานของเเนอส"
        },
        {
          id: "5.2",
          text: "ติดตามความก้านบรับในตอาร้านคืนพัทางงานรเทียมลากพนางกับตี้อบทพอเรืโมรับงานเเพอบารากับไงทับว่ยด"
        },
        {
          id: "5.3",
          text: "มองเอขางกับตรประดักงานประหยุคนานพอสึ่งองคความเป็นสื้อกตอง ผล้งาน เเละมอทรกจำในการกระดับมาตรางกนนคืนพางใน็มเปิบท"
        }
      ]
    }
  ];

  const handleScoreChange = (itemId, score) => {
    setScores(prev => ({
      ...prev,
      [itemId]: score
    }));
  };

  const calculateAverage = () => {
    const values = Object.values(scores);
    if (values.length === 0) return '0.00';
    const sum = values.reduce((acc, val) => acc + Number(val), 0);
    return (sum / values.length).toFixed(2);
  };

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold text-center mb-8 text-gray-800">
          แบบประเมินพฤติกรรม (Competency)
        </h1>

        {/* ตารางประเมิน */}
        <div className="bg-white rounded-lg shadow-lg overflow-hidden">
          <table className="w-full border-collapse">
            <thead className="bg-gray-200">
              <tr>
                <th className="border border-gray-400 px-4 py-3 text-left font-semibold">
                  พฤติกรรม / คำอธิบาย
                </th>
                <th className="border border-gray-400 px-4 py-3 text-center font-semibold w-24">
                  5
                </th>
                <th className="border border-gray-400 px-4 py-3 text-center font-semibold w-24">
                  4
                </th>
                <th className="border border-gray-400 px-4 py-3 text-center font-semibold w-24">
                  3
                </th>
                <th className="border border-gray-400 px-4 py-3 text-center font-semibold w-24">
                  2
                </th>
                <th className="border border-gray-400 px-4 py-3 text-center font-semibold w-24">
                  1
                </th>
              </tr>
            </thead>
            <tbody>
              {evaluationData.map((section) => (
                <React.Fragment key={section.id}>
                  {/* หัวข้อหลัก */}
                  <tr className="bg-blue-50">
                    <td
                      colSpan="6"
                      className="border border-gray-400 px-4 py-3 font-bold text-gray-800"
                    >
                      {section.title}
                    </td>
                  </tr>

                  {/* รายการย่อย */}
                  {section.subItems.map((item, idx) => (
                    <tr key={item.id} className="hover:bg-gray-50">
                      <td className="border border-gray-400 px-4 py-3">
                        <div className="flex">
                          <span className="font-semibold mr-2">{item.id}</span>
                          <span className="text-gray-700">{item.text}</span>
                        </div>
                      </td>
                      {[5, 4, 3, 2, 1].map((score) => (
                        <td
                          key={score}
                          className="border border-gray-400 text-center"
                        >
                          <input
                            type="radio"
                            name={item.id}
                            value={score}
                            checked={scores[item.id] === score}
                            onChange={() => handleScoreChange(item.id, score)}
                            className="w-5 h-5 cursor-pointer"
                          />
                        </td>
                      ))}
                    </tr>
                  ))}
                </React.Fragment>
              ))}
            </tbody>
          </table>
        </div>

        {/* สรุปผล */}
        <div className="mt-8 bg-white rounded-lg shadow-lg p-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-xl font-semibold text-gray-800 mb-2">
                สรุปผลการประเมิน
              </h3>
              <p className="text-gray-600">
                ประเมินแล้ว: {Object.keys(scores).length} รายการ
              </p>
            </div>
            <div className="text-right">
              <p className="text-gray-600 mb-1">คะแนนเฉลี่ย</p>
              <p className="text-5xl font-bold text-blue-600">
                {calculateAverage()}
              </p>
            </div>
          </div>

          {/* ปุ่มดำเนินการ */}
          <div className="mt-6 flex gap-4">
            <button
              onClick={() => {
                // บันทึกข้อมูล
                console.log('Scores:', scores);
                alert('บันทึกการประเมินเรียบร้อย!');
              }}
              className="flex-1 bg-blue-600 text-white py-3 px-6 rounded-lg font-semibold hover:bg-blue-700 transition-colors"
            >
              บันทึกการประเมิน
            </button>
            <button
              onClick={() => navigate(-1)}
              className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg font-semibold hover:bg-gray-50 transition-colors"
            >
              ยกเลิก
            </button>
          </div>
        </div>

        {/* คำอธิบายระดับคะแนน */}
        <div className="mt-6 bg-white rounded-lg shadow-lg p-6">
          <h3 className="text-lg font-semibold mb-4 text-gray-800">
            คำอธิบายระดับคะแนน
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4 text-sm">
            <div className="text-center">
              <div className="font-bold text-green-600 mb-1">5 - ดีเยี่ยม</div>
              <p className="text-gray-600">ปฏิบัติได้เกินมาตรฐาน</p>
            </div>
            <div className="text-center">
              <div className="font-bold text-blue-600 mb-1">4 - ดีมาก</div>
              <p className="text-gray-600">ปฏิบัติได้ดีกว่ามาตรฐาน</p>
            </div>
            <div className="text-center">
              <div className="font-bold text-yellow-600 mb-1">3 - ดี</div>
              <p className="text-gray-600">ปฏิบัติได้ตามมาตรฐาน</p>
            </div>
            <div className="text-center">
              <div className="font-bold text-orange-600 mb-1">2 - พอใช้</div>
              <p className="text-gray-600">ต้องปรับปรุง</p>
            </div>
            <div className="text-center">
              <div className="font-bold text-red-600 mb-1">1 - ต้องปรับปรุง</div>
              <p className="text-gray-600">ต่ำกว่ามาตรฐาน</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EvaluationForm;