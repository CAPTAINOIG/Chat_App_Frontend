import { useState, useEffect } from 'react';
import { FaPhone, FaVideo, FaPhoneSlash, FaTimes, FaCheck, FaClock } from 'react-icons/fa';
import { getUsers } from '../api/authApi';

const CallHistory = ({ userId }) => {
  const [callHistory, setCallHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchCallHistory();
  }, []);

  const fetchCallHistory = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // For now, we'll use mock data since the API endpoint isn't implemented yet
      // TODO: Replace with actual API call when backend is ready
      // const response = await apiService.get('/user/callHistory');
      // setCallHistory(response.data.callHistory);
      
      // Mock data for testing
      const mockCallHistory = [
        {
          callId: 'call_1',
          callType: 'video',
          status: 'ended',
          isIncoming: true,
          duration: 120000,
          startTime: new Date(Date.now() - 3600000).toISOString(),
          participantId: 'user_2',
          participantName: 'John Doe'
        },
        {
          callId: 'call_2',
          callType: 'voice',
          status: 'missed',
          isIncoming: true,
          duration: 0,
          startTime: new Date(Date.now() - 7200000).toISOString(),
          participantId: 'user_3',
          participantName: 'Jane Smith'
        },
        {
          callId: 'call_3',
          callType: 'voice',
          status: 'ended',
          isIncoming: false,
          duration: 65000,
          startTime: new Date(Date.now() - 86400000).toISOString(),
          participantId: 'user_2',
          participantName: 'John Doe'
        }
      ];
      
      setCallHistory(mockCallHistory);
    } catch (error) {
      console.error('Failed to fetch call history:', error);
      setError('Failed to load call history');
    } finally {
      setLoading(false);
    }
  };

  const formatDuration = (duration) => {
    if (duration === 0) return '0s';
    
    const seconds = Math.floor(duration / 1000);
    const minutes = Math.floor(seconds / 60);
    const hrs = Math.floor(minutes / 60);

    if (hrs > 0) {
      return `${hrs}:${(minutes % 60).toString().padStart(2, '0')}:${(seconds % 60).toString().padStart(2, '0')}`;
    }
    return `${minutes}:${(seconds % 60).toString().padStart(2, '0')}`;
  };

  const getCallIcon = (call) => {
    const callTypeIcon = call.callType === 'video' ? <FaVideo /> : <FaPhone />;
    
    let statusIcon = null;
    let statusColor = '';

    switch (call.status) {
      case 'missed':
        statusIcon = <FaPhoneSlash />;
        statusColor = 'text-red-500';
        break;
      case 'rejected':
        statusIcon = <FaTimes />;
        statusColor = 'text-red-500';
        break;
      case 'ended':
        statusIcon = <FaCheck />;
        statusColor = 'text-green-500';
        break;
      default:
        statusIcon = <FaClock />;
        statusColor = 'text-yellow-500';
    }

    return (
      <div className="flex items-center gap-2">
        <span className="text-primary-500">{callTypeIcon}</span>
        <span className={statusColor}>{statusIcon}</span>
      </div>
    );
  };

  const getCallStatusText = (call) => {
    const prefix = call.isIncoming ? 'Incoming' : 'Outgoing';
    const type = call.callType;
    
    switch (call.status) {
      case 'missed':
        return `Missed ${type} call`;
      case 'rejected':
        return `${prefix} ${type} call (rejected)`;
      case 'ended':
        return `${prefix} ${type} call`;
      default:
        return `${prefix} ${type} call`;
    }
  };

  const formatTime = (timestamp) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 60) {
      return diffMins === 0 ? 'Just now' : `${diffMins}m ago`;
    } else if (diffHours < 24) {
      return `${diffHours}h ago`;
    } else if (diffDays < 7) {
      return `${diffDays}d ago`;
    } else {
      return date.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: date.getFullYear() !== now.getFullYear() ? 'numeric' : undefined
      });
    }
  };

  if (loading) {
    return (
      <div className="p-6 bg-white dark:bg-surface-800 rounded-lg">
        <h3 className="text-lg font-semibold text-surface-900 dark:text-surface-50 mb-4">Call History</h3>
        <div className="flex items-center justify-center py-8">
          <div className="w-8 h-8 border-2 border-primary-600 border-t-transparent rounded-full animate-spin"></div>
          <span className="ml-3 text-surface-600 dark:text-surface-400">Loading call history...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6 bg-white dark:bg-surface-800 rounded-lg">
        <h3 className="text-lg font-semibold text-surface-900 dark:text-surface-50 mb-4">Call History</h3>
        <div className="text-center py-8">
          <p className="text-red-400 mb-2">{error}</p>
          <button 
            onClick={fetchCallHistory}
            className="text-primary-500 hover:text-primary-400 text-sm"
          >
            Try again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 bg-white dark:bg-surface-800 rounded-lg">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-surface-900 dark:text-surface-50">Call History</h3>
        <button
          onClick={fetchCallHistory}
          className="text-sm text-primary-500 hover:text-primary-400 transition-colors"
        >
          Refresh
        </button>
      </div>

      {callHistory.length === 0 ? (
        <div className="text-center py-8">
          <div className="w-12 h-12 mx-auto mb-3 bg-surface-200 dark:bg-surface-700 rounded-full flex items-center justify-center">
            <FaPhone className="text-surface-500 dark:text-surface-400" />
          </div>
          <p className="text-surface-600 dark:text-surface-400 text-sm">No calls yet</p>
        </div>
      ) : (
        <div className="space-y-3">
          {callHistory.map((call) => (
            <div 
              key={call.callId} 
              className={`
                flex items-center gap-4 p-3 rounded-lg border transition-colors hover:bg-surface-100 dark:hover:bg-surface-700/50
                ${call.status === 'missed' 
                  ? 'border-red-500/30 bg-red-500/5' 
                  : 'border-surface-300 dark:border-surface-600 bg-surface-50 dark:bg-surface-900/30'
                }
              `}
            >
              {/* Call Icon */}
              <div className="flex-shrink-0">
                {getCallIcon(call)}
              </div>

              {/* Call Info */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <p className="font-medium text-surface-900 dark:text-surface-50 truncate">
                    {call.participantName}
                  </p>
                  {call.status === 'missed' && (
                    <span className="text-xs bg-red-500/20 text-red-400 px-2 py-0.5 rounded-full">
                      Missed
                    </span>
                  )}
                </div>
                <p className="text-sm text-surface-600 dark:text-surface-400 mb-1">
                  {getCallStatusText(call)}
                </p>
                <div className="flex items-center gap-3 text-xs text-surface-500 dark:text-surface-500">
                  <span>{formatTime(call.startTime)}</span>
                  {call.duration > 0 && (
                    <>
                      <span>•</span>
                      <span>{formatDuration(call.duration)}</span>
                    </>
                  )}
                </div>
              </div>

              {/* Call direction indicator */}
              <div className="flex-shrink-0">
                <div className={`
                  w-2 h-2 rounded-full
                  ${call.isIncoming ? 'bg-blue-500' : 'bg-green-500'}
                `} />
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default CallHistory;