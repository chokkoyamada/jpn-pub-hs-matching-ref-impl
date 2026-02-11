import React, { useState, useEffect } from 'react';
import { Form, FormGroup, FormLabel, FormSelect, FormError } from '@/components/ui/Form';
import { Button } from '@/components/ui/Button';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/Card';
import { fetchData, postData } from '@/lib/api';
import { School, Application, ApplicationSubmission } from '@/lib/types';

/**
 * 応募フォームのプロパティ
 */
interface ApplicationFormProps {
  studentId: number;
  onSuccess?: () => void;
}

/**
 * 学生の応募情報編集フォームコンポーネント
 */
const ApplicationForm: React.FC<ApplicationFormProps> = ({ studentId, onSuccess }) => {
  // 高校一覧
  const [schools, setSchools] = useState<School[]>([]);
  // 現在の応募情報
  const [applications, setApplications] = useState<Application[]>([]);
  // 新しい応募情報
  const [newApplications, setNewApplications] = useState<{
    school_id: number;
    preference_order: number;
  }[]>([]);
  // ローディング状態
  const [loading, setLoading] = useState(false);
  // エラーメッセージ
  const [error, setError] = useState<string | null>(null);
  // 成功メッセージ
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // 高校一覧と応募情報を取得
  useEffect(() => {
    const fetchSchools = async () => {
      setLoading(true);
      try {
        const schoolsResponse = await fetchData<School[]>('/schools');
        if (schoolsResponse.success && schoolsResponse.data) {
          setSchools(schoolsResponse.data);
        } else {
          setError('高校情報の取得に失敗しました');
        }

        const applicationsResponse = await fetchData<Application[]>(`/students/${studentId}/applications`);
        if (applicationsResponse.success && applicationsResponse.data) {
          setApplications(applicationsResponse.data);

          // 既存の応募情報をフォーム用に変換
          const formattedApplications = applicationsResponse.data.map(app => ({
            school_id: app.school_id,
            preference_order: app.preference_order
          }));
          setNewApplications(formattedApplications);
        }
      } catch (err) {
        setError('データの取得中にエラーが発生しました');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchSchools();
  }, [studentId]);

  // 応募情報を追加
  const addApplication = () => {
    if (newApplications.length >= 5) {
      setError('応募できる高校は最大5校までです');
      return;
    }

    // 使用されていない高校と希望順位を見つける
    const usedSchoolIds = newApplications.map(app => app.school_id);
    const availableSchools = schools.filter(school => !usedSchoolIds.includes(school.id));

    if (availableSchools.length === 0) {
      setError('応募可能な高校がありません');
      return;
    }

    const usedOrders = newApplications.map(app => app.preference_order);
    let nextOrder = 1;
    while (usedOrders.includes(nextOrder)) {
      nextOrder++;
    }

    setNewApplications([
      ...newApplications,
      {
        school_id: availableSchools[0].id,
        preference_order: nextOrder
      }
    ]);
    setError(null);
  };

  // 応募情報を削除
  const removeApplication = (index: number) => {
    const updatedApplications = [...newApplications];
    updatedApplications.splice(index, 1);
    setNewApplications(updatedApplications);
    setError(null);
  };

  // 応募情報の高校を変更
  const handleSchoolChange = (index: number, schoolId: number) => {
    const updatedApplications = [...newApplications];
    updatedApplications[index].school_id = schoolId;
    setNewApplications(updatedApplications);
  };

  // 応募情報の希望順位を変更
  const handleOrderChange = (index: number, order: number) => {
    // 同じ希望順位が既に使用されているかチェック
    const isDuplicate = newApplications.some((app, i) => i !== index && app.preference_order === order);
    if (isDuplicate) {
      setError('同じ希望順位は使用できません');
      return;
    }

    const updatedApplications = [...newApplications];
    updatedApplications[index].preference_order = order;
    setNewApplications(updatedApplications);
    setError(null);
  };

  // フォームを送信
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccessMessage(null);

    // バリデーション
    if (newApplications.length === 0) {
      setError('少なくとも1つの高校を選択してください');
      setLoading(false);
      return;
    }

    // 希望順位の重複チェック
    const orders = newApplications.map(app => app.preference_order);
    if (new Set(orders).size !== orders.length) {
      setError('希望順位が重複しています');
      setLoading(false);
      return;
    }

    try {
      const submission: ApplicationSubmission = {
        applications: newApplications
      };

      const response = await postData(`/students/${studentId}/applications`, submission);

      if (response.success) {
        setSuccessMessage('応募情報を保存しました');
        // 最新の応募情報を取得
        const updatedResponse = await fetchData<Application[]>(`/students/${studentId}/applications`);
        if (updatedResponse.success && updatedResponse.data) {
          setApplications(updatedResponse.data);
        }

        if (onSuccess) {
          onSuccess();
        }
      } else {
        setError(response.message || '応募情報の保存に失敗しました');
      }
    } catch (err) {
      setError('応募情報の送信中にエラーが発生しました');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>応募情報編集</CardTitle>
        <CardDescription>希望する高校と希望順位を設定してください（最大5校まで）</CardDescription>
      </CardHeader>
      <CardContent>
        <Form onSubmit={handleSubmit}>
          {error && (
            <FormError className="mb-4">{error}</FormError>
          )}

          {successMessage && (
            <div className="mb-4 p-2 bg-green-50 text-green-700 rounded">
              {successMessage}
            </div>
          )}

          <div className="space-y-4">
            {newApplications.map((app, index) => (
              <div key={index} className="flex items-end gap-4 p-4 border rounded bg-gray-50">
                <FormGroup className="flex-1">
                  <FormLabel htmlFor={`school-${index}`}>高校</FormLabel>
                  <FormSelect
                    id={`school-${index}`}
                    value={app.school_id}
                    onChange={(e) => handleSchoolChange(index, Number(e.target.value))}
                    disabled={loading}
                  >
                    {schools.map(school => (
                      <option
                        key={school.id}
                        value={school.id}
                        disabled={newApplications.some((a, i) => i !== index && a.school_id === school.id)}
                      >
                        {school.name} ({school.location})
                      </option>
                    ))}
                  </FormSelect>
                </FormGroup>

                <FormGroup className="w-32">
                  <FormLabel htmlFor={`order-${index}`}>希望順位</FormLabel>
                  <FormSelect
                    id={`order-${index}`}
                    value={app.preference_order}
                    onChange={(e) => handleOrderChange(index, Number(e.target.value))}
                    disabled={loading}
                  >
                    {[1, 2, 3, 4, 5].map(order => (
                      <option
                        key={order}
                        value={order}
                      >
                        {order}
                      </option>
                    ))}
                  </FormSelect>
                </FormGroup>

                <Button
                  type="button"
                  variant="destructive"
                  onClick={() => removeApplication(index)}
                  disabled={loading}
                >
                  削除
                </Button>
              </div>
            ))}

            <div className="flex justify-center">
              <Button
                type="button"
                variant="outline"
                onClick={addApplication}
                disabled={loading || newApplications.length >= 5}
              >
                高校を追加
              </Button>
            </div>
          </div>
        </Form>
      </CardContent>
      <CardFooter className="flex justify-between">
        <Button
          type="button"
          variant="ghost"
          onClick={() => {
            // フォームをリセット
            const formattedApplications = applications.map(app => ({
              school_id: app.school_id,
              preference_order: app.preference_order
            }));
            setNewApplications(formattedApplications);
            setError(null);
            setSuccessMessage(null);
          }}
          disabled={loading}
        >
          キャンセル
        </Button>
        <Button
          type="submit"
          onClick={handleSubmit}
          disabled={loading}
        >
          {loading ? '保存中...' : '保存'}
        </Button>
      </CardFooter>
    </Card>
  );
};

export default ApplicationForm;
