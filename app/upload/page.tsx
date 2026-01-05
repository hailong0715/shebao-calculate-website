'use client'

import { useState } from 'react'
import Link from 'next/link'

export default function UploadPage() {
  const [selectedCity, setSelectedCity] = useState<string>('')
  const [cities, setCities] = useState<Array<{ city_name: string; year: string }>>([])
  const [isOverwrite, setIsOverwrite] = useState<boolean>(true)
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)

  // 获取城市列表
  const fetchCities = async () => {
    try {
      const res = await fetch('/api/upload/cities')
      if (res.ok) {
        const data = await res.json()
        setCities(data.cities || [])
      }
    } catch (error) {
      console.error('获取城市列表失败:', error)
    }
  }

  // 上传城市数据
  const handleUploadCities = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setLoading(true)
    setMessage(null)

    const formData = new FormData(e.currentTarget)
    const file = formData.get('file') as File

    if (!file) {
      setMessage({ type: 'error', text: '请选择文件' })
      setLoading(false)
      return
    }

    try {
      const res = await fetch('/api/upload/cities', {
        method: 'POST',
        body: formData,
      })

      const data = await res.json()

      if (res.ok) {
        setMessage({ type: 'success', text: `成功上传 ${data.count} 条城市数据` })
        fetchCities() // 刷新城市列表
      } else {
        setMessage({ type: 'error', text: data.error || '上传失败' })
      }
    } catch (error) {
      setMessage({ type: 'error', text: '上传失败，请检查网络连接' })
    } finally {
      setLoading(false)
    }
  }

  // 上传工资数据
  const handleUploadSalaries = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setLoading(true)
    setMessage(null)

    const formData = new FormData(e.currentTarget)
    const file = formData.get('file') as File

    if (!file) {
      setMessage({ type: 'error', text: '请选择文件' })
      setLoading(false)
      return
    }

    try {
      const res = await fetch('/api/upload/salaries', {
        method: 'POST',
        body: formData,
      })

      const data = await res.json()

      if (res.ok) {
        setMessage({ type: 'success', text: `成功上传 ${data.count} 条工资数据` })
      } else {
        setMessage({ type: 'error', text: data.error || '上传失败' })
      }
    } catch (error) {
      setMessage({ type: 'error', text: '上传失败，请检查网络连接' })
    } finally {
      setLoading(false)
    }
  }

  // 执行计算
  const handleCalculate = async () => {
    if (!selectedCity) {
      setMessage({ type: 'error', text: '请先选择城市' })
      return
    }

    setLoading(true)
    setMessage(null)

    try {
      const res = await fetch('/api/calculate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ city: selectedCity, isOverwrite }),
      })

      const data = await res.json()

      if (res.ok) {
        setMessage({ type: 'success', text: `计算完成！处理了 ${data.count} 位员工的数据` })
      } else {
        setMessage({ type: 'error', text: data.error || '计算失败' })
      }
    } catch (error) {
      setMessage({ type: 'error', text: '计算失败，请检查网络连接' })
    } finally {
      setLoading(false)
    }
  }

  // 页面加载时获取城市列表
  useState(() => {
    fetchCities()
  })

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <div className="max-w-4xl mx-auto">
        {/* 返回按钮 */}
        <Link href="/" className="inline-flex items-center text-gray-600 hover:text-gray-800 mb-8">
          <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          返回首页
        </Link>

        <h1 className="text-3xl font-bold text-gray-800 mb-8">数据上传与操作</h1>

        {/* 消息提示 */}
        {message && (
          <div className={`mb-6 p-4 rounded-lg ${message.type === 'success' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
            {message.text}
          </div>
        )}

        <div className="space-y-6">
          {/* 城市数据上传 */}
          <div className="bg-white rounded-xl shadow-lg p-6">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">上传城市数据</h2>
            <form onSubmit={handleUploadCities} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  选择 Excel 文件
                </label>
                <input
                  type="file"
                  name="file"
                  accept=".xlsx,.xls"
                  className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                />
              </div>
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
              >
                {loading ? '上传中...' : '上传城市数据'}
              </button>
            </form>
          </div>

          {/* 工资数据上传 */}
          <div className="bg-white rounded-xl shadow-lg p-6">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">上传工资数据</h2>
            <form onSubmit={handleUploadSalaries} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  选择 Excel 文件
                </label>
                <input
                  type="file"
                  name="file"
                  accept=".xlsx,.xls"
                  className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                />
              </div>
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
              >
                {loading ? '上传中...' : '上传工资数据'}
              </button>
            </form>
          </div>

          {/* 计算控制 */}
          <div className="bg-white rounded-xl shadow-lg p-6">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">执行计算</h2>

            {/* 城市选择 */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                选择城市
              </label>
              <select
                value={selectedCity}
                onChange={(e) => setSelectedCity(e.target.value)}
                className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                onClick={fetchCities}
              >
                <option value="">-- 请选择城市 --</option>
                {cities.map((city, index) => (
                  <option key={index} value={city.city_name}>
                    {city.city_name} ({city.year})
                  </option>
                ))}
              </select>
            </div>

            {/* 数据处理选项 */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                数据处理方式
              </label>
              <div className="space-y-2">
                <label className="flex items-center">
                  <input
                    type="radio"
                    name="dataOption"
                    checked={isOverwrite}
                    onChange={() => setIsOverwrite(true)}
                    className="mr-2"
                  />
                  <span className="text-gray-700">覆盖旧数据（删除之前的计算结果）</span>
                </label>
                <label className="flex items-center">
                  <input
                    type="radio"
                    name="dataOption"
                    checked={!isOverwrite}
                    onChange={() => setIsOverwrite(false)}
                    className="mr-2"
                  />
                  <span className="text-gray-700">追加新数据（保留之前的计算结果）</span>
                </label>
              </div>
            </div>

            <button
              onClick={handleCalculate}
              disabled={loading || !selectedCity}
              className="w-full bg-green-600 text-white py-3 px-4 rounded-md hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors font-semibold"
            >
              {loading ? '计算中...' : '执行计算并存储结果'}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
