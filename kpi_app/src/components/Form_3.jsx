import React ,{useState}from "react";
  const behaviorData = [
    {c_id:1,
      c_title:"1.ให้ความสำคัญกับคุณภาพงาน (Quality Focus)",
      categories: [
        {
          id: 1,
          title: "ระดับ 1: ต้องการทำงานให้ถูกต้องและชัดเจน",
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
      ]
    },
    {c_id:2,
      c_title:"2.ให้ความสำคัญกับผู้รับบริการ (Customer Focus)",
      categories: [
      {
        id: 1,
        title: "ระดับ 1: ต้องการทำงานให้ถูกต้องและชัดเจน",
        subItem : [
          {
            id: "1.1",
            text:"ควย"
          },
          {
            id: "1.2",
            text:"ควย2"
          },
          {
            id: "1.3",
            text:"ควย3"
          },
          {
            id: "1.4",
            text:"ควย4"
          }
        ]
      },
      {
        id: 2,
        title: "ระดับ 2: ต้องการทำงานให้ถูกต้องและชัดเจน",
        subItem : [
          {
            id: "2.1",
            text:"ควย"
          },
          {
            id: "2.2",
            text:"ควย2"
          },
          {
            id: "2.3",
            text:"ควย3"
          },
          {
            id: "2.4",
            text:"ควย4"
          }
        ]
      },
      {
        id: 3,
        title: "ระดับ 3: ต้องการทำงานให้ถูกต้องและชัดเจน",
        subItem : [
          {
            id: "3.1",
            text:"ควย"
          },
          {
            id: "3.2",
            text:"ควย2"
          },
          {
            id: "3.3",
            text:"ควย3"
          },
          {
            id: "3.4",
            text:"ควย4"
          }
        ]
      },
      {
        id: 4,
        title: "ระดับ 4: ต้องการทำงานให้ถูกต้องและชัดเจน",
        subItem : [
          {
            id: "4.1",
            text:"ควย"
          },
          {
            id: "4.2",
            text:"ควย2"
          },
          {
            id: "4.3",
            text:"ควย3"
          }
        ]
      },
      {
        id: 5,
        title: "ระดับ 5: ต้องการทำงานให้ถูกต้องและชัดเจน",
        subItem : [
          {
            id: "5.1",
            text:"ควย"
          },
          {
            id: "5.2",
            text:"ควย2"
          },
          {
            id: "5.3",
            text:"ควย3"
          }
        ]
      }
    ] 
  },
  {c_id:3,
    c_title:"3.ให้ความสำคัญกับการทำงานเป็นทีม (Teamwork)",
    categories: [
    {
      id: 1,
      title: "ระดับ 1: ต้องการทำงานให้ถูกต้องและชัดเจน",
      subItem : [
        {
          id: "1.1",
          text:"ควย"
        },
        {
          id: "1.2",
          text:"ควย2"
        },
        {
          id: "1.3",
          text:"ควย3"
        }
      ]
    },
    {
      id: 2,
      title: "ระดับ 2: ต้องการทำงานให้ถูกต้องและชัดเจน",
      subItem : [
        {
          id: "2.1",
          text:"ควย"
        },
        {
          id: "2.2",
          text:"ควย2"
        },
        {
          id: "2.3",
          text:"ควย3"
        }
      ]
    },
    {
      id: 3,
      title: "ระดับ 3: ต้องการทำงานให้ถูกต้องและชัดเจน",
      subItem : [
        {
          id: "3.1",
          text:"ควย"
        },
        {
          id: "3.2",
          text:"ควย2"
        },
        {
          id: "3.3",
          text:"ควย3"
        },
        {
          id: "3.4",
          text:"ควย4"
        }
      ]
    },
    {
      id: 4,
      title: "ระดับ 4: ต้องการทำงานให้ถูกต้องและชัดเจน",
      subItem : [
        {
          id: "4.1",
          text:"ควย"  
        },
        {
          id: "4.2",
          text:"ควย2"
        },
        {
          id: "4.3",
          text:"ควย3"
        }
      ]
    },
    {
      id: 5,
      title: "ระดับ 5: ต้องการทำงานให้ถูกต้องและชัดเจน",
      subItem : [
        {
          id: "5.1",
          text:"ควย"
        },
        {
          id: "5.2",
          text:"ควย2"
        },
        {
          id: "5.3",
          text:"ควย3"
        }
      ]
    }
    ]
  },
  {c_id:4,
    c_title:"4.มุ่งเน้นบุคลากร (People Focus)",
    categories: [
      {
        id: 1,
        title: "ระดับ 1: ต้องการทำงานให้ถูกต้องและชัดเจน",
        subItem : [
          {
            id: "1.1",
            text:"ควย"
          },
          {
            id: "1.2",
            text:"ควย2"
          },
          {
            id: "1.3",
            text:"ควย3"
          },
          {
            id: "1.4",
            text:"ควย4"
          }
        ]
      },
      {
        id: 2,
        title: "ระดับ 2: ต้องการทำงานให้ถูกต้องและชัดเจน",
        subItem : [
          {
            id: "2.1",
            text:"ควย"
          },
          {
            id: "2.2",
            text:"ควย2"
          },
          {
            id: "2.3",
            text:"ควย3"
          },
          {
            id: "2.4",
            text:"ควย4"
          }
        ]
      },
      {
        id: 3,
        title: "ระดับ 3: ต้องการทำงานให้ถูกต้องและชัดเจน",
        subItem : [
          {
            id: "3.1",
            text:"ควย"
          },
          {
            id: "3.2",
            text:"ควย2"
          },
          {
            id: "3.3",
            text:"ควย3"
          },
          {
            id: "3.4",
            text:"ควย4"
          }
        ]
      },
      {
        id: 4,
        title: "ระดับ 4: ต้องการทำงานให้ถูกต้องและชัดเจน",
        subItem : [
          {
            id: "4.1",
            text:"ควย"
          },
          {
            id: "4.2",
            text:"ควย2"
          },
          {
            id: "4.3",
            text:"ควย3"
          },
          {
            id: "4.4",
            text:"ควย4"
          }
        ]
      },
      {
        id: 5,
        title: "ระดับ 5: ต้องการทำงานให้ถูกต้องและชัดเจน",
        subItem : [
          {
            id: "5.1",
            text:"ควย"
          },
          {
            id: "5.2",
            text:"ควย2"
          },
          {
            id: "5.3",
            text:"ควย3"
          },
          {
            id: "5.4",
            text:"ควย4"
          }
        ]
      }
    ]
  }
];

  
const Form_3 = ({ onSummaryChange, categoryId = 'all', expectedScore = 5 }) => {
    // สร้าง state สำหรับเก็บคะแนนพฤติกรรม
    const [behaviorScores, setBehaviorScores] = useState({});
    // เตรียมชุดหมวดหมู่ที่จะเรนเดอร์
    const categoriesToRender =
      categoryId === 'all'
        ? behaviorData
        : behaviorData.filter(c => c.c_id === Number(categoryId));

    // ปรับชื่อรายการย่อยให้ใช้งานได้ (รองรับ subItems และ subItem)
    const getItems = (level) => (level.subItems ?? level.subItem ?? []);

    // จัดการคะแนนของหัวข้อพฤติกรรมให้ไม่ต่ำกว่า 1 และไม่เกิน 5
  const handleBehaviorScoreChange = (levelKey, value) => {
    let v = parseInt(value, 10);
    if (Number.isNaN(v)) {
      // อนุญาตให้เป็นค่าว่างชั่วคราวระหว่างพิมพ์
      setBehaviorScores(prev => ({ ...prev, [levelKey]: '' }));
      return;
    }
    if (v < 1) v = 1;
    if (v > 5) v = 5;
    setBehaviorScores(prev => ({ ...prev, [levelKey]: v }));
  };

  // รายงานสรุปของ Behavior ให้พาเรนต์ (ถ้ามี) เมื่อคะแนนเปลี่ยน
  React.useEffect(() => {
    if (typeof onSummaryChange === 'function') {
      const allLevelKeys = categoriesToRender.flatMap(cat =>
        (cat.categories ?? []).map(l => `${cat.c_id}-${l.id}`)
      );
      const values = allLevelKeys
        .map(key => behaviorScores[key])
        .filter(v => v !== '' && v != null && !Number.isNaN(Number(v)));
      const total = categoriesToRender.reduce((sum, cat) => sum + (cat.categories?.length || 0), 0);
      const evaluatedCount = allLevelKeys.filter(key => behaviorScores[key] !== '' && behaviorScores[key] != null).length;
      const avg = values.length ? (values.reduce((a, b) => Number(a) + Number(b), 0) / values.length).toFixed(2) : '0.00';
      onSummaryChange({ evaluatedCount, total, average: avg });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [behaviorScores]);

    return (
    <div>
     <h2 className="text-2xl font-bold mb-4 text-center text-gray-800 mt-12">
               ส่วนที่ 3 คะแนนความสามารถ (Performance Behavior)
             </h2>
               <div className="overflow-x-auto mb-8">
               <table className="w-full border-collapse text-sm">
                 <thead className="bg-gray-200 font-semibold">
                   <tr>
                     <th className="border border-gray-400 px-3 py-2 text-center">พฤติกรรม</th>
                     <th className="border border-gray-400 px-3 py-2 text-center w-24">คะแนนคาดหวัง</th>
                     <th className="border border-gray-400 px-3 py-2 text-center w-24">คะแนนประเมิน</th>
                     <th className="border border-gray-400 px-3 py-2 text-center w-64">ความคิดเห็น/ข้อเสนอแนะของผู้ถูกประเมิน</th>
                   </tr>
                 </thead>
                 <tbody>
                   {/* เรนเดอร์ทุกหมวด (4 ชุดข้อมูล) พร้อมหัวข้อหมวดและระดับ */}
                   {categoriesToRender.map((cat) => (
                     <React.Fragment key={cat.c_id}>
                       {/* หัวข้อประเภทการประเมินของหมวด */}
                       <tr className="bg-blue-100">
                         <td colSpan="4" className='border border-gray-400 font-bold text-left px-4 py-3'>
                           {cat.c_title}
                         </td>
                       </tr>

                       {/* ระดับของหมวด */}
                       {(cat.categories ?? []).map((level) => {
                         const items = getItems(level);
                         const rowSpan = Math.max(items.length, 1);
                         const levelKey = `${cat.c_id}-${level.id}`;
                         return (
                           <React.Fragment key={level.id}>
                             {items.map((item, idx) => (
                               <tr key={item.id} className="hover:bg-gray-50">
                                 <td className="border border-gray-400 px-3 py-2 text-left align-top">
                                   <div className="flex flex-col">
                                     {/* แสดงหัวข้อหลัก (ระดับ) เฉพาะแถวแรกของกลุ่ม */}
                                     {idx === 0 && (
                                       <div className="font-bold text-gray-800 mb-2">
                                         {level.title}
                                       </div>
                                     )}
                                     <div className="flex">
                                       <span className="font-semibold mr-2 whitespace-nowrap">{item.id}</span>
                                       <span className="text-gray-700">{item.text}</span>
                                     </div>
                                   </div>
                                 </td>
                                 {/* คะแนนแสดงเฉพาะแถวแรกของแต่ละกลุ่ม และ merge cells */}
                                 {idx === 0 ? (
                                   <>
                                     <td 
                                       rowSpan={rowSpan} 
                                       className="border border-gray-400 text-center align-middle font-semibold text-lg"
                                     >
                                       {expectedScore}
                                     </td>
                                     <td 
                                       rowSpan={rowSpan} 
                                       className="border border-gray-400 text-center align-middle"
                                     >
                                       <input 
                                         type="number" 
                                         min="1" 
                                         max="5"
                                         step="1"
                                         inputMode="numeric"
                                         className="w-16 px-2 py-2 border border-gray-300 rounded text-center text-lg font-semibold"
                                         value={behaviorScores[levelKey] ?? ''}
                                         onChange={(e) => handleBehaviorScoreChange(levelKey, e.target.value)}
                                         onBlur={(e) => {
                                           if (!e.target.value || Number(e.target.value) < 1) {
                                             handleBehaviorScoreChange(levelKey, 1);
                                           }
                                         }}
                                         placeholder="1"
                                       />
                                     </td>
                                     <td 
                                       rowSpan={rowSpan} 
                                       className="border border-gray-400 align-top p-2"
                                     >
                                       <textarea 
                                         rows="4"
                                         className="w-full px-2 py-1 border border-gray-300 rounded text-sm resize-none"
                                         placeholder="กรอกความคิดเห็น..."
                                       />
                                     </td>
                                   </>
                                 ) : null}
                               </tr>
                             ))}
                           </React.Fragment>
                         );
                       })}
                     </React.Fragment>
                   ))}
                 </tbody>
               </table>
             </div>
</div>
    );
}

export default Form_3;