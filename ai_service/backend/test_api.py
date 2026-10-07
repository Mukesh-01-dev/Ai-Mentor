import os
import threading
import unittest
from concurrent.futures import ThreadPoolExecutor

os.environ.setdefault("GEMINI_API_KEY", "test-gemini-key")
os.environ.setdefault("GROQ_API_KEY", "test-groq-key")
os.environ.setdefault("CLOUDINARY_CLOUD_NAME", "test-cloud")
os.environ.setdefault("CLOUDINARY_API_KEY", "test-cloudinary-key")
os.environ.setdefault("CLOUDINARY_API_SECRET", "test-cloudinary-secret")

from fastapi import BackgroundTasks

from api import LessonRequest, generate_lesson, get_status, job_status


class GenerateLessonConcurrencyTests(unittest.TestCase):
    def test_identical_topics_get_unique_jobs_and_isolated_status(self):
        requests = [
            LessonRequest(course="Physics", topic="Gravity", celebrity="modi")
            for _ in range(8)
        ]
        barrier = threading.Barrier(len(requests))

        def submit(data):
            background_tasks = BackgroundTasks()
            barrier.wait()
            response = generate_lesson(data, background_tasks)
            return data, response, background_tasks

        with ThreadPoolExecutor(max_workers=len(requests)) as executor:
            results = list(executor.map(submit, requests))

        job_ids = [response["jobId"] for _, response, _ in results]
        self.assertEqual(len(job_ids), len(set(job_ids)))
        for filename_key in ("filename", "text_file", "audio_file"):
            filenames = [response[filename_key] for _, response, _ in results]
            self.assertEqual(len(filenames), len(set(filenames)))

        for data, response, background_tasks in results:
            self.assertEqual(response["filename"], f"{response['jobId']}.mp4")
            self.assertEqual(response["text_file"], f"{response['jobId']}.txt")
            self.assertEqual(response["audio_file"], f"{response['jobId']}.mp3")
            self.assertEqual(len(background_tasks.tasks), 1)
            task = background_tasks.tasks[0]
            self.assertIs(task.args[0], data)
            self.assertEqual(task.args[1], response["jobId"])

        try:
            for index, job_id in enumerate(job_ids):
                expected_status = {
                    "status": "ready",
                    "cloudinary_url": f"https://example.test/{index}",
                }
                job_status[job_id] = expected_status
                self.assertEqual(get_status(job_id), expected_status)
        finally:
            for job_id in job_ids:
                job_status.pop(job_id, None)


if __name__ == "__main__":
    unittest.main()