import React from 'react';
import { useFileContext } from '../context/FileContext';
import { DollarSign, Download, Files, TrendingUp, Activity } from 'lucide-react';

const Dashboard = () => {
  const { files, downloads, earnings, totalFiles, totalDownloads } = useFileContext();

  const stats = [
    {
      title: 'Total Earnings',
      value: `$${earnings.toFixed(2)}`,
      icon: DollarSign,
      color: 'text-green-400',
      bgColor: 'bg-green-500/20',
      change: '+12.5%'
    },
    {
      title: 'Total Downloads',
      value: totalDownloads.toString(),
      icon: Download,
      color: 'text-blue-400',
      bgColor: 'bg-blue-500/20',
      change: '+8.2%'
    },
    {
      title: 'Active Files',
      value: totalFiles.toString(),
      icon: Files,
      color: 'text-purple-400',
      bgColor: 'bg-purple-500/20',
      change: '+3'
    },
    {
      title: 'Avg. Price',
      value: `$${files.length ? (files.reduce((sum, f) => sum + f.price, 0) / files.length).toFixed(3) : '0.000'}`,
      icon: TrendingUp,
      color: 'text-orange-400',
      bgColor: 'bg-orange-500/20',
      change: '+5.1%'
    }
  ];

  const recentDownloads = downloads.slice(-5).reverse();

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-dark-text mb-2">Dashboard</h1>
        <p className="text-dark-muted">Monitor your file sales and earnings</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <div key={index} className="card-dark p-6">
              <div className="flex items-center justify-between mb-4">
                <div className={`p-3 rounded-lg ${stat.bgColor}`}>
                  <Icon className={`w-6 h-6 ${stat.color}`} />
                </div>
                <span className="text-sm text-green-400 font-medium">
                  {stat.change}
                </span>
              </div>
              <h3 className="text-2xl font-bold text-dark-text mb-1">
                {stat.value}
              </h3>
              <p className="text-sm text-dark-muted">{stat.title}</p>
            </div>
          );
        })}
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Revenue Chart */}
        <div className="card-dark p-6">
          <h3 className="text-lg font-semibold text-dark-text mb-4">
            Revenue Overview
          </h3>
          <div className="h-64 flex items-end justify-between space-x-2">
            {[0.2, 0.4, 0.3, 0.6, 0.8, 0.5, 0.9, 0.7, 1.2, 0.8, 1.5, 1.1].map((height, index) => (
              <div
                key={index}
                className="bg-gradient-to-t from-purple-500 to-blue-500 rounded-t flex-1"
                style={{ height: `${height * 60}%` }}
              />
            ))}
          </div>
          <div className="flex justify-between text-xs text-dark-muted mt-2">
            <span>Jan</span>
            <span>Dec</span>
          </div>
        </div>

        {/* Download Activity */}
        <div className="card-dark p-6">
          <h3 className="text-lg font-semibold text-dark-text mb-4">
            Download Activity
          </h3>
          <div className="h-64 flex items-end justify-between space-x-1">
            {[12, 8, 15, 22, 18, 25, 30, 28, 35, 32, 40, 38, 45, 42].map((downloads, index) => (
              <div
                key={index}
                className="bg-blue-500 rounded-t flex-1"
                style={{ height: `${(downloads / 45) * 100}%` }}
              />
            ))}
          </div>
          <div className="flex justify-between text-xs text-dark-muted mt-2">
            <span>2 weeks ago</span>
            <span>Today</span>
          </div>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="card-dark p-6">
        <h3 className="text-lg font-semibold text-dark-text mb-4 flex items-center">
          <Activity className="w-5 h-5 mr-2" />
          Recent Downloads
        </h3>
        
        {recentDownloads.length > 0 ? (
          <div className="space-y-3">
            {recentDownloads.map((download) => (
              <div
                key={download.id}
                className="flex items-center justify-between p-4 bg-dark-bg rounded-lg border border-dark-border"
              >
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-blue-500/20 rounded-lg flex items-center justify-center">
                    <Download className="w-5 h-5 text-blue-400" />
                  </div>
                  <div>
                    <p className="text-dark-text font-medium">{download.fileName}</p>
                    <p className="text-dark-muted text-sm">
                      {download.buyerWalletAddress} • {download.downloadedAt.toLocaleString()}
                    </p>
                  </div>
                </div>
                <div className="text-green-400 font-semibold">
                  +${download.amount.toFixed(3)}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12 text-dark-muted">
            <Download className="w-12 h-12 mx-auto mb-4 opacity-50" />
            <p>No downloads yet. Upload your first file to get started!</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;