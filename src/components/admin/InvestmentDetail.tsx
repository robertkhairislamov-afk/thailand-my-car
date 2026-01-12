import { ArrowLeft, Copy, ExternalLink, CheckCircle, XCircle, AlertCircle, Clock, DollarSign, Calendar, TrendingUp } from 'lucide-react';
import { useState } from 'react';

interface InvestmentDetailProps {
  isDark: boolean;
  onBack: () => void;
}

export function InvestmentDetail({ isDark, onBack }: InvestmentDetailProps) {
  const [copied, setCopied] = useState(false);
  const [notes, setNotes] = useState('');

  // Mock data - replace with real data from API
  const investment = {
    id: 42,
    status: 'confirmed',
    amount: 13800,
    amountCrypto: 13800,
    tokenSymbol: 'USDT',
    tier: {
      id: 1,
      name: 'Долгосрочное участие',
      roiPercent: null,
      duration: 'ongoing'
    },
    blockchain: 'BSC',
    transactionHash: '0x742d35fA8B5A9C2D1F3C7A8B9E2D4B1C3E4f5A6B',
    blockNumber: 12345678,
    fromAddress: '0x742d35fA8B5A9C2D1F3C7A8B9E2D4B1C3E4f5A6B',
    toAddress: '0x8B5A9C2D1F3C7A8B9E2D4B1C3E4f5A6B742d35fA',
    investmentDate: '2024-11-24T10:30:00Z',
    unlockDate: null,
    expectedReturn: null,
    confirmedAt: '2024-11-24T11:00:00Z',
    investor: {
      walletAddress: '0x742d35fA8B5A9C2D1F3C7A8B9E2D4B1C3E4f5A6B',
      email: 'investor@example.com',
      telegram: '@cryptoinvestor',
      totalInvested: 13800,
      joinedDate: '2024-11-24T10:30:00Z',
      kycVerified: false
    },
    timeline: [
      { status: 'created', timestamp: '2024-11-24T10:30:00Z', admin: null, note: 'Инвестиция создана' },
      { status: 'submitted', timestamp: '2024-11-24T10:32:00Z', admin: null, note: 'Транзакция отправлена' },
      { status: 'confirmed', timestamp: '2024-11-24T11:00:00Z', admin: 'Admin', note: 'Проверено, транзакция подтверждена на блокчейне' }
    ]
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return '#FFC850';
      case 'confirmed': return '#28B48C';
      case 'completed': return '#009696';
      case 'rejected': return '#E74C3C';
      default: return '#FFFAF0';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending': return <Clock className="w-5 h-5" />;
      case 'confirmed': return <CheckCircle className="w-5 h-5" />;
      case 'completed': return <CheckCircle className="w-5 h-5" />;
      case 'rejected': return <XCircle className="w-5 h-5" />;
      default: return <AlertCircle className="w-5 h-5" />;
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'pending': return 'Ожидает подтверждения';
      case 'confirmed': return 'Подтверждено';
      case 'completed': return 'Завершено';
      case 'rejected': return 'Отклонено';
      default: return status;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div className="flex items-center gap-4">
          <button
            onClick={onBack}
            className="p-2 rounded-xl transition-all hover:scale-105"
            style={{
              background: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)',
              color: isDark ? '#FFFAF0' : '#143C50'
            }}
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h1 className="text-3xl mb-1" style={{ color: isDark ? '#FFFAF0' : '#143C50', fontWeight: 700 }}>
              Инвестиция #{investment.id}
            </h1>
            <p className="opacity-70" style={{ color: isDark ? '#FFFAF0' : '#143C50' }}>
              {new Date(investment.investmentDate).toLocaleDateString('ru-RU', { 
                day: 'numeric', 
                month: 'long', 
                year: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
              })}
            </p>
          </div>
        </div>
        
        <div className="flex items-center gap-3">
          <div 
            className="flex items-center gap-2 px-4 py-2 rounded-xl"
            style={{
              background: `${getStatusColor(investment.status)}20`,
              color: getStatusColor(investment.status)
            }}
          >
            {getStatusIcon(investment.status)}
            <span style={{ fontWeight: 600 }}>{getStatusText(investment.status)}</span>
          </div>
          
          {investment.status === 'pending' && (
            <div className="flex gap-2">
              <button
                className="px-4 py-2 rounded-xl transition-all hover:scale-105"
                style={{
                  background: '#28B48C',
                  color: '#FFFAF0'
                }}
              >
                Подтвердить
              </button>
              <button
                className="px-4 py-2 rounded-xl transition-all hover:scale-105"
                style={{
                  background: 'rgba(231,76,60,0.2)',
                  color: '#E74C3C',
                  border: '1px solid rgba(231,76,60,0.3)'
                }}
              >
                Отклонить
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column */}
        <div className="lg:col-span-2 space-y-6">
          {/* Investment Info */}
          <div 
            className="rounded-2xl p-6 backdrop-blur-xl border"
            style={{
              background: isDark ? 'rgba(255, 255, 255, 0.05)' : 'rgba(255, 255, 255, 0.9)',
              borderColor: isDark ? 'rgba(0, 150, 150, 0.3)' : 'rgba(0, 150, 150, 0.2)'
            }}
          >
            <h2 className="text-xl mb-6" style={{ color: isDark ? '#FFFAF0' : '#143C50', fontWeight: 600 }}>
              Информация об инвестиции
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <div className="text-sm opacity-70 mb-1" style={{ color: isDark ? '#FFFAF0' : '#143C50' }}>Сумма</div>
                <div className="text-2xl mb-1" style={{ color: isDark ? '#FFFAF0' : '#143C50', fontWeight: 700 }}>
                  ${investment.amount.toLocaleString()}
                </div>
                <div className="text-sm opacity-70" style={{ color: isDark ? '#FFFAF0' : '#143C50' }}>
                  {investment.amountCrypto} {investment.tokenSymbol}
                </div>
              </div>

              <div>
                <div className="text-sm opacity-70 mb-1" style={{ color: isDark ? '#FFFAF0' : '#143C50' }}>Тир</div>
                <div className="text-xl mb-1" style={{ color: isDark ? '#FFFAF0' : '#143C50', fontWeight: 600 }}>
                  {investment.tier.name}
                </div>
                <div className="text-sm opacity-70" style={{ color: isDark ? '#FFFAF0' : '#143C50' }}>
                  {investment.tier.duration === 'ongoing' ? 'Долгосрочное' : `${investment.tier.duration} мес`}
                </div>
              </div>

              {investment.tier.roiPercent && (
                <>
                  <div>
                    <div className="text-sm opacity-70 mb-1" style={{ color: isDark ? '#FFFAF0' : '#143C50' }}>ROI</div>
                    <div className="text-2xl" style={{ color: '#28B48C', fontWeight: 700 }}>
                      +{investment.tier.roiPercent}%
                    </div>
                  </div>

                  <div>
                    <div className="text-sm opacity-70 mb-1" style={{ color: isDark ? '#FFFAF0' : '#143C50' }}>Ожидаемый возврат</div>
                    <div className="text-2xl" style={{ color: '#28B48C', fontWeight: 700 }}>
                      ${investment.expectedReturn?.toLocaleString()}
                    </div>
                  </div>
                </>
              )}

              {investment.unlockDate && (
                <div>
                  <div className="text-sm opacity-70 mb-1" style={{ color: isDark ? '#FFFAF0' : '#143C50' }}>Дата разблокировки</div>
                  <div className="flex items-center gap-2">
                    <Calendar className="w-5 h-5 opacity-50" style={{ color: isDark ? '#FFFAF0' : '#143C50' }} />
                    <div style={{ color: isDark ? '#FFFAF0' : '#143C50', fontWeight: 600 }}>
                      {new Date(investment.unlockDate).toLocaleDateString('ru-RU')}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Blockchain Data */}
          <div 
            className="rounded-2xl p-6 backdrop-blur-xl border"
            style={{
              background: isDark ? 'rgba(255, 255, 255, 0.05)' : 'rgba(255, 255, 255, 0.9)',
              borderColor: isDark ? 'rgba(0, 150, 150, 0.3)' : 'rgba(0, 150, 150, 0.2)'
            }}
          >
            <h2 className="text-xl mb-6" style={{ color: isDark ? '#FFFAF0' : '#143C50', fontWeight: 600 }}>
              Данные блокчейна
            </h2>
            
            <div className="space-y-4">
              <div>
                <div className="text-sm opacity-70 mb-2" style={{ color: isDark ? '#FFFAF0' : '#143C50' }}>Transaction Hash</div>
                <div className="flex items-center gap-2 p-3 rounded-lg" style={{ background: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)' }}>
                  <code className="flex-1 text-sm font-mono" style={{ color: isDark ? '#FFFAF0' : '#143C50' }}>
                    {investment.transactionHash}
                  </code>
                  <button
                    onClick={() => copyToClipboard(investment.transactionHash)}
                    className="p-2 rounded-lg transition-all hover:scale-105"
                    style={{ background: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)' }}
                  >
                    {copied ? <CheckCircle className="w-4 h-4" style={{ color: '#28B48C' }} /> : <Copy className="w-4 h-4" style={{ color: isDark ? '#FFFAF0' : '#143C50' }} />}
                  </button>
                  <a
                    href={`https://bscscan.com/tx/${investment.transactionHash}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-2 rounded-lg transition-all hover:scale-105"
                    style={{ background: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)' }}
                  >
                    <ExternalLink className="w-4 h-4" style={{ color: '#009696' }} />
                  </a>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <div className="text-sm opacity-70 mb-2" style={{ color: isDark ? '#FFFAF0' : '#143C50' }}>Blockchain</div>
                  <div className="px-3 py-2 rounded-lg" style={{ background: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)' }}>
                    <span style={{ color: isDark ? '#FFFAF0' : '#143C50', fontWeight: 600 }}>
                      {investment.blockchain}
                    </span>
                  </div>
                </div>

                <div>
                  <div className="text-sm opacity-70 mb-2" style={{ color: isDark ? '#FFFAF0' : '#143C50' }}>Block Number</div>
                  <div className="px-3 py-2 rounded-lg" style={{ background: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)' }}>
                    <span style={{ color: isDark ? '#FFFAF0' : '#143C50', fontWeight: 600 }}>
                      {investment.blockNumber.toLocaleString()}
                    </span>
                  </div>
                </div>
              </div>

              <div>
                <div className="text-sm opacity-70 mb-2" style={{ color: isDark ? '#FFFAF0' : '#143C50' }}>From Address</div>
                <div className="flex items-center gap-2 p-3 rounded-lg" style={{ background: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)' }}>
                  <code className="flex-1 text-sm font-mono" style={{ color: isDark ? '#FFFAF0' : '#143C50' }}>
                    {investment.fromAddress}
                  </code>
                  <button
                    onClick={() => copyToClipboard(investment.fromAddress)}
                    className="p-2 rounded-lg transition-all hover:scale-105"
                    style={{ background: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)' }}
                  >
                    <Copy className="w-4 h-4" style={{ color: isDark ? '#FFFAF0' : '#143C50' }} />
                  </button>
                </div>
              </div>

              <div>
                <div className="text-sm opacity-70 mb-2" style={{ color: isDark ? '#FFFAF0' : '#143C50' }}>To Address (Our Wallet)</div>
                <div className="flex items-center gap-2 p-3 rounded-lg" style={{ background: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)' }}>
                  <code className="flex-1 text-sm font-mono" style={{ color: isDark ? '#FFFAF0' : '#143C50' }}>
                    {investment.toAddress}
                  </code>
                  <button
                    onClick={() => copyToClipboard(investment.toAddress)}
                    className="p-2 rounded-lg transition-all hover:scale-105"
                    style={{ background: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)' }}
                  >
                    <Copy className="w-4 h-4" style={{ color: isDark ? '#FFFAF0' : '#143C50' }} />
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Admin Notes */}
          <div 
            className="rounded-2xl p-6 backdrop-blur-xl border"
            style={{
              background: isDark ? 'rgba(255, 255, 255, 0.05)' : 'rgba(255, 255, 255, 0.9)',
              borderColor: isDark ? 'rgba(0, 150, 150, 0.3)' : 'rgba(0, 150, 150, 0.2)'
            }}
          >
            <h2 className="text-xl mb-4" style={{ color: isDark ? '#FFFAF0' : '#143C50', fontWeight: 600 }}>
              Заметки администратора
            </h2>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Добавить внутренние заметки..."
              className="w-full p-4 rounded-xl resize-none"
              rows={4}
              style={{
                background: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)',
                border: `1px solid ${isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)'}`,
                color: isDark ? '#FFFAF0' : '#143C50'
              }}
            />
            <button
              className="mt-3 px-4 py-2 rounded-xl transition-all hover:scale-105"
              style={{
                background: '#009696',
                color: '#FFFAF0'
              }}
            >
              Сохранить заметку
            </button>
          </div>
        </div>

        {/* Right Column */}
        <div className="space-y-6">
          {/* Investor Info */}
          <div 
            className="rounded-2xl p-6 backdrop-blur-xl border"
            style={{
              background: isDark ? 'rgba(255, 255, 255, 0.05)' : 'rgba(255, 255, 255, 0.9)',
              borderColor: isDark ? 'rgba(0, 150, 150, 0.3)' : 'rgba(0, 150, 150, 0.2)'
            }}
          >
            <h2 className="text-xl mb-4" style={{ color: isDark ? '#FFFAF0' : '#143C50', fontWeight: 600 }}>
              Инвестор
            </h2>
            
            <div className="space-y-4">
              <div>
                <div className="text-sm opacity-70 mb-2" style={{ color: isDark ? '#FFFAF0' : '#143C50' }}>Wallet Address</div>
                <div className="flex items-center gap-2 p-3 rounded-lg" style={{ background: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)' }}>
                  <code className="flex-1 text-xs font-mono truncate" style={{ color: isDark ? '#FFFAF0' : '#143C50' }}>
                    {investment.investor.walletAddress}
                  </code>
                  <button
                    onClick={() => copyToClipboard(investment.investor.walletAddress)}
                    className="p-2 rounded-lg flex-shrink-0"
                    style={{ background: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)' }}
                  >
                    <Copy className="w-4 h-4" style={{ color: isDark ? '#FFFAF0' : '#143C50' }} />
                  </button>
                </div>
              </div>

              {investment.investor.email && (
                <div>
                  <div className="text-sm opacity-70 mb-2" style={{ color: isDark ? '#FFFAF0' : '#143C50' }}>Email</div>
                  <div className="p-3 rounded-lg" style={{ background: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)' }}>
                    <span style={{ color: isDark ? '#FFFAF0' : '#143C50' }}>
                      {investment.investor.email}
                    </span>
                  </div>
                </div>
              )}

              {investment.investor.telegram && (
                <div>
                  <div className="text-sm opacity-70 mb-2" style={{ color: isDark ? '#FFFAF0' : '#143C50' }}>Telegram</div>
                  <div className="p-3 rounded-lg" style={{ background: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)' }}>
                    <span style={{ color: isDark ? '#FFFAF0' : '#143C50' }}>
                      {investment.investor.telegram}
                    </span>
                  </div>
                </div>
              )}

              <div className="pt-4" style={{ borderTop: `1px solid ${isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)'}` }}>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm opacity-70" style={{ color: isDark ? '#FFFAF0' : '#143C50' }}>Всего инвестировано</span>
                  <span style={{ color: '#28B48C', fontWeight: 600 }}>${investment.investor.totalInvested.toLocaleString()}</span>
                </div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm opacity-70" style={{ color: isDark ? '#FFFAF0' : '#143C50' }}>Дата присоединения</span>
                  <span style={{ color: isDark ? '#FFFAF0' : '#143C50' }}>
                    {new Date(investment.investor.joinedDate).toLocaleDateString('ru-RU')}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm opacity-70" style={{ color: isDark ? '#FFFAF0' : '#143C50' }}>KYC</span>
                  <span 
                    className="px-2 py-1 rounded-lg text-xs"
                    style={{
                      background: investment.investor.kycVerified ? 'rgba(40,180,140,0.2)' : 'rgba(255,200,80,0.2)',
                      color: investment.investor.kycVerified ? '#28B48C' : '#FFC850'
                    }}
                  >
                    {investment.investor.kycVerified ? 'Verified' : 'Not verified'}
                  </span>
                </div>
              </div>

              <button
                className="w-full px-4 py-2 rounded-xl transition-all hover:scale-105 mt-4"
                style={{
                  background: isDark ? 'rgba(0,150,150,0.2)' : 'rgba(0,150,150,0.1)',
                  color: '#009696',
                  border: `1px solid ${isDark ? 'rgba(0,150,150,0.3)' : 'rgba(0,150,150,0.2)'}`
                }}
              >
                Посмотреть профиль
              </button>
            </div>
          </div>

          {/* Timeline */}
          <div 
            className="rounded-2xl p-6 backdrop-blur-xl border"
            style={{
              background: isDark ? 'rgba(255, 255, 255, 0.05)' : 'rgba(255, 255, 255, 0.9)',
              borderColor: isDark ? 'rgba(0, 150, 150, 0.3)' : 'rgba(0, 150, 150, 0.2)'
            }}
          >
            <h2 className="text-xl mb-4" style={{ color: isDark ? '#FFFAF0' : '#143C50', fontWeight: 600 }}>
              История
            </h2>
            
            <div className="space-y-4">
              {investment.timeline.map((event, index) => (
                <div key={index} className="relative pl-6">
                  {index < investment.timeline.length - 1 && (
                    <div 
                      className="absolute left-2 top-6 bottom-0 w-px"
                      style={{ background: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)' }}
                    />
                  )}
                  <div 
                    className="absolute left-0 top-1 w-4 h-4 rounded-full"
                    style={{ background: getStatusColor(event.status) }}
                  />
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span style={{ color: isDark ? '#FFFAF0' : '#143C50', fontWeight: 600 }}>
                        {getStatusText(event.status)}
                      </span>
                      {event.admin && (
                        <span className="text-xs opacity-70" style={{ color: isDark ? '#FFFAF0' : '#143C50' }}>
                          by {event.admin}
                        </span>
                      )}
                    </div>
                    <p className="text-sm opacity-70 mb-1" style={{ color: isDark ? '#FFFAF0' : '#143C50' }}>
                      {event.note}
                    </p>
                    <span className="text-xs opacity-50" style={{ color: isDark ? '#FFFAF0' : '#143C50' }}>
                      {new Date(event.timestamp).toLocaleString('ru-RU')}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
