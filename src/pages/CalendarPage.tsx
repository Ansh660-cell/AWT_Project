import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Calendar } from '../components/ui/calendar';
import { format, isSameDay } from 'date-fns';

export const CalendarPage: React.FC = () => {
  const [tasks, setTasks] = useState<any[]>([]);
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());

  useEffect(() => {
    const fetchTasks = async () => {
      try {
        const data = await api.tasks.getAll();
        setTasks(data);
      } catch (err) {
        console.error(err);
      }
    };
    fetchTasks();
  }, []);

  const tasksOnSelectedDate = tasks.filter(t => 
    t.deadline && isSameDay(new Date(t.deadline), selectedDate || new Date())
  );

  const taskDates = tasks.map(t => new Date(t.deadline));

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-3xl font-bold">Calendar</h1>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2">
          <CardContent className="p-4">
            <Calendar
              mode="single"
              selected={selectedDate}
              onSelect={setSelectedDate}
              className="rounded-md border w-full"
              modifiers={{
                hasTask: taskDates
              }}
              modifiersStyles={{
                hasTask: { fontWeight: 'bold', textDecoration: 'underline', color: 'blue' }
              }}
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>
              {selectedDate ? format(selectedDate, 'MMMM d, yyyy') : 'Select a date'}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {tasksOnSelectedDate.length > 0 ? (
                tasksOnSelectedDate.map(task => (
                  <div key={task.id} className="p-3 bg-white border rounded-lg shadow-sm">
                    <p className="font-semibold">{task.title}</p>
                    <p className="text-sm text-muted-foreground">{task.subject}</p>
                    <div className="flex justify-between items-center mt-2">
                      <span className={`text-xs px-2 py-0.5 rounded-full ${
                        task.status === 'Completed' ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-700'
                      }`}>
                        {task.status}
                      </span>
                      <span className="text-xs font-medium">{task.priority}</span>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-center text-muted-foreground py-8">No tasks due on this day.</p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
