export default function AboutPage() {
  return (
    <div>
      {/* 히어로 */}
      <section className="bg-navy text-white py-24 px-4 text-center">
        <div className="max-w-3xl mx-auto">
          <p className="text-gold font-medium mb-2">About Ilsan-Anyang</p>
          <h1 className="text-4xl md:text-5xl font-bold mb-4">
            기술로 잇는 일상,
            <br />
            경기도에서 시작된 스마트홈
          </h1>
        </div>
      </section>

      {/* 브랜드 스토리 */}
      <section className="py-20 px-4">
        <div className="max-w-4xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
          <div>
            <h2 className="text-2xl font-bold text-navy mb-4">우리의 이야기</h2>
            <p className="text-gray-600 leading-relaxed mb-4">
              일산안양은 2026년 경기도 고양시에서 설립된 프리미엄 스마트홈
              가전 전문 브랜드입니다. 일산과 안양, 두 도시의 이름을 합쳐 만든
              이 브랜드는 경기도 어디에서나 가까운 이웃처럼 믿을 수 있는
              제품을 제공한다는 철학을 담고 있습니다.
            </p>
            <p className="text-gray-600 leading-relaxed">
              복잡한 기술을 일상에 자연스럽게 녹여내는 것이 우리의 목표입니다.
              로봇청소기부터 스마트 조명까지, 연결된 삶의 모든 순간을
              함께합니다.
            </p>
          </div>
          <div className="bg-navy rounded-2xl p-8 text-white">
            <div className="grid grid-cols-2 gap-6 text-center">
              {[
                { value: "2026", label: "설립 연도" },
                { value: "5종+", label: "제품 카테고리" },
                { value: "경기도", label: "본사 소재지" },
                { value: "100%", label: "정품 보증" },
              ].map((stat) => (
                <div key={stat.label}>
                  <p className="text-3xl font-bold text-gold">{stat.value}</p>
                  <p className="text-sm text-gray-400 mt-1">{stat.label}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* 미션 & 비전 */}
      <section className="py-20 px-4 bg-gray-50">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-2xl font-bold text-navy mb-12 text-center">
            미션 & 비전
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="bg-white rounded-xl p-8 border border-gray-100">
              <h3 className="text-gold font-bold text-lg mb-3">Mission</h3>
              <p className="text-navy font-semibold text-xl mb-2">
                &quot;기술을 삶 속으로&quot;
              </p>
              <p className="text-gray-600 text-sm leading-relaxed">
                최신 스마트홈 기술을 누구나 쉽게 접근할 수 있도록 만들고,
                일상을 더 편리하고 쾌적하게 변화시킵니다.
              </p>
            </div>
            <div className="bg-white rounded-xl p-8 border border-gray-100">
              <h3 className="text-gold font-bold text-lg mb-3">Vision</h3>
              <p className="text-navy font-semibold text-xl mb-2">
                &quot;경기도 대표 스마트홈 브랜드&quot;
              </p>
              <p className="text-gray-600 text-sm leading-relaxed">
                경기도를 넘어 전국 모든 가정에서 일산안양 제품으로 더 스마트한
                삶을 누릴 수 있도록 끊임없이 혁신합니다.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 회사 정보 */}
      <section className="py-16 px-4">
        <div className="max-w-2xl mx-auto">
          <h2 className="text-2xl font-bold text-navy mb-8 text-center">
            회사 정보
          </h2>
          <table className="w-full text-sm">
            <tbody className="divide-y">
              {[
                ["상호명", "일산안양 (Ilsan-Anyang)"],
                ["설립일", "2026년"],
                ["대표자", "김일산"],
                ["본사", "경기도 고양시 일산동구 중앙로 123"],
                ["사업자등록번호", "123-45-67890"],
                ["고객센터", "1588-0000 (평일 09:00~18:00)"],
                ["이메일", "support@ilsan-anyang.com"],
              ].map(([label, value]) => (
                <tr key={label}>
                  <td className="py-3 pr-6 text-muted-foreground w-1/3">
                    {label}
                  </td>
                  <td className="py-3 font-medium text-navy">{value}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
