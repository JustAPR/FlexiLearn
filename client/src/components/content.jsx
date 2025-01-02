import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate, Link } from 'react-router-dom';

const Content = () => {
  const location = useLocation();
  const navigate = useNavigate();

  const [expandedSubjects, setExpandedSubjects] = useState({}); // Object to track expanded subjects by id
  const [subjectNames, setSubjectNames] = useState([]);

  useEffect(() => {
    const fetchSubjects = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) {
          // Redirect to / if there is no token
          navigate('/');
          return;
        }

        // Send a request to the backend to fetch subjects
        const subjectsResponse = await fetch('http://localhost:5000/api/get-subjects', {
          method: 'GET',
          headers: {
            Authorization: token,
            'Content-Type': 'application/json',
          },
        });

        if (subjectsResponse.ok) {
          const data = await subjectsResponse.json();

          // Populate subjectNames directly with nested data
          setSubjectNames(data.subjects);
        } else {
          console.error('Error fetching subjects');
        }
      } catch (error) {
        console.error('Error fetching subjects', error);
      }
    };

    fetchSubjects();
  }, [navigate]);

  const handleSubjectClick = (subjectId) => {
    setExpandedSubjects(prevState => {
      const updatedExpandedSubjects = { ...prevState };
      if (updatedExpandedSubjects[subjectId]) {
        delete updatedExpandedSubjects[subjectId]; // Collapse the subject if already expanded
      } else {
        updatedExpandedSubjects[subjectId] = true; // Expand the subject
      }
      return updatedExpandedSubjects;
    });
  };

  return (
    <div className="container mx-auto mt-8">
      <h1 className="text-3xl font-bold mb-4">Subjects</h1>
      <div className="flex flex-col max-w-[400px] overflow-y-auto max-h-[700px] pr-4 gap-4">
        {subjectNames.map((subject, index) => (
          subject.name.map((subjectDetail, subIndex) => (
            <div
              key={`${subjectDetail.subject_name}-${subIndex}`} // Use unique key combining subjectDetail.subject_name and subIndex
              className={`bg-white p-4 rounded-md cursor-pointer shadow-md ${
                expandedSubjects[subjectDetail.subject_name] ? 'flex-grow expanded shadow-lg' : 'flex-grow-0'
              }`}
              onClick={() => handleSubjectClick(subjectDetail.subject_name)} // Toggle the subject by its _id
            >
              <h2 className="text-xl font-bold mb-2">{subjectDetail.subject_name}</h2>
              {expandedSubjects[subjectDetail.subject_name] && (
                <div>
                  <h3 className="text-lg font-semibold mb-2">Units:</h3>
                  <ul>
                    {subjectDetail.units.map((unit, unitIndex) => (
                      <li key={unitIndex} className="mb-2">
                        <div className="flex flex-col gap-3">
                          <Link
                            to={`/dashboard/content/${subjectDetail.subject_name}/${unit.unit_name}`}
                            className="border px-2 py-1 m-2 rounded text-blue-500 hover:bg-blue-100 hover:border-blue-700 transition"
                          >
                            {unit.unit_name}
                          </Link>
                          {expandedSubjects[subjectDetail.subject_name] && (
                            <ul className="ml-6">
                              {unit.topics.map((topic, topicIndex) => (
                                <li key={topicIndex} className="mb-1">
                                  <div className="text-blue-600">
                                    {topic.topic_name}: {topic.topic_description}
                                  </div>
                                </li>
                              ))}
                            </ul>
                          )}
                        </div>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          ))
        ))}
      </div>
    </div>
  );
};

export default Content;
