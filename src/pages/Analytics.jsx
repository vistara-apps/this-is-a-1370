import React from 'react';
import { useFileContext } from '../context/FileContext';
import { TrendingUp, Download, DollarSign, Calendar, BarChart3 } from 'lucide-react';

const Analytics = () => {
  const { files, downloads, earnings } = useFileContext();

  const topPerformingFiles = files
    .sort((a, b) => b.downloadCount - a.downloadCount)
    .slice(0, 5);

  const recentDownloads = downloads
    .slice(-10)
    .reverse();

  const monthlyData = [
    { month: 'Jan', downloads: 12, earnings: 0.6 },
    { month: 'Feb', downloads: 19, earnings: 0.95 },
    { month: 'Mar', downloads: 15, earnings: 0.75 },
    { month: 'Apr', downloads: 25, earnings: 1.25 },
    { month: 'May', downloads: 32, earnings: 1.6 },
    { month: 'Jun', downloads: 28, earnings: 1.4 },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-dark-text mb-2">Analytics</h1>
        <p className="text-dark-muted">Detailed insights into your file performance</p>
      </div>

      {/* Overview Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="card-dark p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-green-500/20 rounded-lg">
              <DollarSign className="w-6 h-6 text-green-400" />
            </div>
            <span className="text-sm text-green-400">↗ 15.3%</span>
          </div>
          <h3 className="text-2xl font-bold text-dark-text">${earnings.toFixed(2)}</h3>
          <p className="text-dark-muted">Total Revenue</p>
        </div>

        <div className="card-dark p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-blue-500/20 rounded-lg">
              <Download className="w-6 h-6 text-blue-400" />
            </div>
            <span className="text-sm text-blue-400">↗ 8.1%</span>
          </div>
          <h3 className="text-2xl font-bold text-dark-text">{downloads.length}</h3>
          <p className="text-dark-muted">Total Downloads</p>
        </div>

        <div className="card-dark p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-purple-500/20 rounded-lg">
              <TrendingUp className="w-6 h-6 text-purple-400" />
            </div>
            <span className="text-sm text-purple-400">↗ 12.5%</span>
          </div>
          <h3 className="text-2xl font-bold text-dark-text">
            ${files.length ? (earnings / downloads.length).toFixed(3) : '0.000'}
          </h3>
          <p className="text-dark-muted">Avg per Download</p>
        </div>

        <div className="card-dark p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-orange-500/20 rounded-lg">
              <Calendar className="w-6 h-6 text-orange-400" />
            </div>
            <span className="text-sm text-orange-400">↗ 5.2%</span>
          </div>
          <h3 className="text-2xl font-bold text-dark-text">
            {downloads.length ? Math.round(downloads.length / 30) : 0}
          </h3>
          <p className="text-dark-muted">Daily Avg Downloads</p>
        </div>
      </div>

      {/* Performance Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Monthly Performance */}
        <div className="card-dark p-6">
          <h3 className="text-lg font-semibold text-dark-text mb-6 flex items-center">
            <BarChart3 className="w-5 h-5 mr-2" />
            Monthly Performance
          </h3>
          <div className="space-y-4">
            {monthlyData.map((month, index) => (
              <div key={index} className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <span className="w-12 text-dark-muted">{month.month}</span>
                  <div className="flex-1 bg-dark-bg rounded-full h-2 w-32">
                    <div
                      className="bg-gradient-to-r from-purple-500 to-blue-500 h-2 rounded-full"
                      style={{ width: `${(month.downloads / 32) * 100}%` }}
                    />
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-dark-text font-medium">{month.downloads}</div>
                  <div className="text-dark-muted text-sm">${month.earnings.toFixed(2)}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Top Performing Files */}
        <div className="card-dark p-6">
          <h3 className="text-lg font-semibold text-dark-text mb-6">
            Top Performing Files
          </h3>
          <div className="space-y-4">
            {topPerformingFiles.map((file, index) => (
              <div key={file.id} className="flex items-center justify-between p-3 bg-dark-bg rounded-lg">
                <div className="flex items-center space-x-3">
                  <span className="w-6 h-6 bg-blue-500/20 rounded text-blue-400 text-sm font-medium flex items-center justify-center">
                    {index + 1}
                  </span>
                  <div>
                    <p className="text-dark-text font-medium truncate max-w-48">
                      {file.fileName}
                    </p>
                    <p className="text-dark-muted text-sm">
                      {file.downloadCount} downloads
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-green-400 font-medium">
                    ${file.earnings.toFixed(2)}
                  </div>
                  <div className="text-dark-muted text-sm">
                    ${file.price.toFixed(3)} each
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Recent Download Activity */}
      <div className="card-dark p-6">
        <h3 className="text-lg font-semibold text-dark-text mb-6">
          Recent Download Activity
        </h3>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-dark-border">
                <th className="text-left text-dark-muted font-medium pb-3">File</th>
                <th className="text-left text-dark-muted font-medium pb-3">Buyer</th>
                <th className="text-left text-dark-muted font-medium pb-3">Date</th>
                <th className="text-right text-dark-muted font-medium pb-3">Amount</th>
              </tr>
            </thead>
            <tbody>
              {recentDownloads.map((download) => (
                <tr key={download.id} className="border-b border-dark-border/50">
                  <td className="py-4 text-dark-text">{download.fileName}</td>
                  <td className="py-4 text-dark-muted font-mono text-sm">
                    {download.buyerWalletAddress}
                  </td>
                  <td className="py-4 text-dark-muted">
                    {download.downloadedAt.toLocaleDateString()}
                  </td>
                  <td className="py-4 text-right text-green-400 font-medium">
                    ${download.amount.toFixed(3)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Analytics;