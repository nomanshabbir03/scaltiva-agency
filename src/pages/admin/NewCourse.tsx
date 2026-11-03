import { Link, useNavigate } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import CourseForm from "@/components/portal/CourseForm";

export default function NewCourse() {
  const navigate = useNavigate();
  return (
    <div className="max-w-3xl">
      <title>New course | Scaltiva admin</title>
      <Link to="/admin/courses" className="inline-flex items-center gap-2 text-sm font-semibold text-muted-foreground hover:text-primary">
        <ArrowLeft className="size-4" />
        Courses
      </Link>
      <h1 className="mt-4 text-3xl font-semibold">New course</h1>
      <p className="mt-2 text-muted-foreground">After creating it you can add lessons.</p>
      <div className="mt-8">
        <CourseForm onSaved={(course) => navigate(`/admin/courses/${course.id}`)} />
      </div>
    </div>
  );
}
