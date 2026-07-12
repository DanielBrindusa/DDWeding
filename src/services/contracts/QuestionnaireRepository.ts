import type { AttendanceQuestionnaireResponse } from '../../models/questionnaire';

export interface QuestionnaireRepository {
  submitQuestionnaire(response: AttendanceQuestionnaireResponse): Promise<void>;
}
