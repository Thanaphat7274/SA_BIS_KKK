import React from 'react';

// Summary component: presentational and extensible for KPI and Behavior sections
// Props:
// - kpiEvaluatedCount: number
// - kpiTotal: number
// - kpiAverage: string | number
// - behaviorEvaluatedCount?: number
// - behaviorTotal?: number
// - behaviorAverage?: string | number
const Summary = ({
  kpiEvaluatedCount,
  kpiTotal,
  kpiAverage,
  behaviorEvaluatedCount,
  behaviorTotal,
  behaviorAverage,
}) => {
  const hasBehavior =
    typeof behaviorEvaluatedCount === 'number' &&
    typeof behaviorTotal === 'number' &&
    (typeof behaviorAverage === 'number' || typeof behaviorAverage === 'string');

  return (
    <div className="mt-8 bg-blue-50 border border-blue-200 rounded-lg p-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h3 className="font-semibold text-gray-800 mb-1">สรุปผลการประเมิน</h3>
          <p className="text-sm text-gray-600">
            ประเมินแล้ว (KPI): {kpiEvaluatedCount}/{kpiTotal} หัวข้อ
          </p>
          {hasBehavior && (
            <p className="text-sm text-gray-600 mt-1">
              ประเมินแล้ว (Behavior): {behaviorEvaluatedCount}/{behaviorTotal} หมวด
            </p>
          )}
        </div>

        <div className="flex flex-col md:flex-row gap-6 md:gap-10">
          <div className="text-right">
            <p className="text-sm text-gray-600 mb-1">KPI เฉลี่ย</p>
            <p className="text-4xl font-bold text-blue-600">{kpiAverage}</p>
          </div>
          {hasBehavior && (
            <div className="text-right">
              <p className="text-sm text-gray-600 mb-1">Behavior เฉลี่ย</p>
              <p className="text-4xl font-bold text-blue-600">{behaviorAverage}</p>
            </div>
          )}
        </div>
      </div>
        {/* Action Buttons */}
        {/* <div className="mt-6 flex gap-4">
          <button 
            className="flex-1 py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed"
            disabled={Object.keys(evaluationScores).length !== evaluationCriteria.length}
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

        {Object.keys(evaluationScores).length !== evaluationCriteria.length && (
          <p className="mt-3 text-sm text-red-600 text-center">
            * กรุณาประเมินให้ครบทุกหัวข้อก่อนบันทึก
          </p>
        )} */}
    </div>
  );
};

export default Summary;
