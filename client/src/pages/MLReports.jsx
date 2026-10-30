import React, { useState } from 'react';

const MLReports = () => {
  const [activeTab, setActiveTab] = useState('eda');

  // Base URL for our FastAPI static files
  const BASE_URL = "http://127.0.0.1:8000/static";

  return (
    <div className="max-w-7xl mx-auto pb-10">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-800">Machine Learning Analytics</h1>
        <p className="text-gray-500 mt-1">Exploratory Data Analysis, Feature Engineering, and Model Evaluation</p>
      </div>

      {/* Tabs */}
      <div className="flex flex-wrap gap-2 border-b border-gray-200 mb-8">
        <button 
          className={`pb-3 font-bold text-sm px-4 ${activeTab === 'eda' ? 'border-b-4 border-blue-600 text-blue-700' : 'text-gray-500 hover:text-gray-700'}`}
          onClick={() => setActiveTab('eda')}
        >
          Exploratory Data Analysis (EDA)
        </button>
        <button 
          className={`pb-3 font-bold text-sm px-4 ${activeTab === 'pca' ? 'border-b-4 border-blue-600 text-blue-700' : 'text-gray-500 hover:text-gray-700'}`}
          onClick={() => setActiveTab('pca')}
        >
          Feature Engineering & PCA
        </button>
        <button 
          className={`pb-3 font-bold text-sm px-4 ${activeTab === 'models' ? 'border-b-4 border-blue-600 text-blue-700' : 'text-gray-500 hover:text-gray-700'}`}
          onClick={() => setActiveTab('models')}
        >
          Algorithm Performance
        </button>
      </div>

      {/* 1. EDA Section */}
      {activeTab === 'eda' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-200">
            <h3 className="text-center font-bold text-gray-700 mb-2">Target Variable Distribution</h3>
            <img src={`${BASE_URL}/1_target_distribution.png`} alt="Target Distribution" className="w-full h-auto object-contain rounded-lg" />
          </div>
          <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-200">
            <h3 className="text-center font-bold text-gray-700 mb-2">Dropout by Gender</h3>
            <img src={`${BASE_URL}/2_gender_vs_dropout.png`} alt="Gender vs Dropout" className="w-full h-auto object-contain rounded-lg" />
          </div>
          <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-200">
            <h3 className="text-center font-bold text-gray-700 mb-2">Attendance Density</h3>
            <img src={`${BASE_URL}/3_attendance_distribution.png`} alt="Attendance Distribution" className="w-full h-auto object-contain rounded-lg" />
          </div>
          <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-200">
            <h3 className="text-center font-bold text-gray-700 mb-2">Feature Correlation Heatmap</h3>
            <img src={`${BASE_URL}/4_correlation_heatmap.png`} alt="Correlation Heatmap" className="w-full h-auto object-contain rounded-lg" />
          </div>
        </div>
      )}

      {/* 2. Feature Engineering & PCA Section (NEW) */}
      {activeTab === 'pca' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
            <h3 className="text-center font-bold text-gray-700 mb-2">PCA: Dimensionality Reduction</h3>
            <p className="text-xs text-gray-500 text-center mb-4">Real PCA on all 32 attributes. The curve rises almost linearly, so nearly every component is needed to reach 90% of the variance: the attributes are largely independent, and PCA cannot compress away the 20 extra ones. The model therefore uses 12 features chosen by importance instead.</p>
            <img src={`${BASE_URL}/5_pca_variance_plot.png`} alt="PCA Variance Plot" className="w-full h-auto object-contain rounded-lg" />
          </div>
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
            <h3 className="text-center font-bold text-gray-700 mb-2">Random Forest: Feature Importance</h3>
            <p className="text-xs text-gray-500 text-center mb-4">Highlights the most critical factors for dropout: attendance, family income and distance lead. Daily commute time ranks high only because it is calculated from distance; the other added attributes score close to zero.</p>
            <img src={`${BASE_URL}/6_feature_importance.png`} alt="Feature Importance" className="w-full h-auto object-contain rounded-lg" />
          </div>
        </div>
      )}

      {/* 3. Models Section */}
      {activeTab === 'models' && (
        <div>
          <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-200 mb-8 max-w-4xl mx-auto">
            <h3 className="text-center font-bold text-gray-700 mb-2">Final Model Accuracy Comparison</h3>
            <img src={`${BASE_URL}/model_results/Final_Model_Comparison.png`} alt="Model Comparison" className="w-full h-auto object-contain rounded-lg" />
          </div>

          <h2 className="text-2xl font-bold text-gray-800 mb-6 border-b pb-2">Individual Confusion Matrices</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {['Logistic_Regression_CM.png', 'Random_Forest_CM.png', 'Support_Vector_Classifier_CM.png', 'Gaussian_Naive_Bayes_CM.png', 'KNN_Classifier_CM.png', 'Perceptron_CM.png'].map((fileName, index) => (
              <div key={index} className="bg-white p-4 rounded-xl shadow-sm border border-gray-200">
                <h3 className="text-center font-bold text-gray-700 mb-2 text-sm">{fileName.replace('_CM.png', '').replace(/_/g, ' ')}</h3>
                <img src={`${BASE_URL}/model_results/${fileName}`} alt={fileName} className="w-full h-auto object-contain rounded-lg" />
              </div>
            ))}
          </div>
        </div>
      )}

    </div>
  );
};

export default MLReports;