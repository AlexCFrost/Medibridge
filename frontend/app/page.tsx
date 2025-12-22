export default function Home() {
  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-3xl font-bold text-gray-900 mb-2">
          Simplify Your Medical Reports
        </h2>
        <p className="text-gray-600">
          Paste your medical report and get a clear, easy-to-understand explanation.
        </p>
      </div>
      
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 space-y-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Medical Report Input
          </label>
          
          <div className="space-y-4">
            <div>
              <label
                htmlFor="file-upload"
                className="flex flex-col items-center justify-center w-full h-32 border-2 border-gray-300 border-dashed rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100 transition-colors"
              >
                <div className="flex flex-col items-center justify-center pt-5 pb-6">
                  <svg className="w-10 h-10 mb-2 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                  </svg>
                  <p className="mb-2 text-sm text-gray-500">
                    <span className="font-semibold">Click to upload</span> or drag and drop
                  </p>
                  <p className="text-xs text-gray-500">PDF, DOC, DOCX, TXT (MAX. 10MB)</p>
                </div>
                <input id="file-upload" type="file" className="hidden" accept=".pdf,.doc,.docx,.txt" />
              </label>
            </div>

            <div className="flex items-center gap-3">
              <div className="flex-1 border-t border-gray-300"></div>
              <span className="text-sm text-gray-500">OR</span>
              <div className="flex-1 border-t border-gray-300"></div>
            </div>

            <div>
              <textarea
                id="report-input"
                rows={8}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none resize-y placeholder:text-gray-900"
                placeholder="Paste your medical report text here..."
              />
            </div>
          </div>
        </div>

        <div>
          <label htmlFor="knowledge-level" className="block text-sm font-medium text-gray-700 mb-2">
            Knowledge Level
          </label>
          <select
            id="knowledge-level"
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none bg-white text-gray-900"
          >
            <option value="basic" className="text-gray-900">Basic - Simple terms and minimal technical language</option>
            <option value="standard" className="text-gray-900">Standard - Balanced explanation with key terms defined</option>
          </select>
        </div>

        <div className="flex justify-center">
          <button className="bg-blue-600 hover:bg-blue-700 text-white font-medium px-8 py-3 rounded-lg transition-colors">
            Simplify Report
          </button>
        </div>
      </div>
    </div>
  );
}
