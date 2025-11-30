from fastapi.middleware.cors import CORSMiddleware
from pool import get_connection
from fastapi import FastAPI, Body
import requests
import re
import pymysql
from fastapi import Query, HTTPException, File, UploadFile, Depends

from fastapi.middleware.cors import CORSMiddleware


app = FastAPI()
origins = [
    "*",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
async def root():
    return {"message": "Hello World"}

'''
#== Registration START ===
@app.post("/login-check-student")
async def login_check_student(username=Body("user_id"), password=Body("password")):
    connection = None
    cursor = None
    try:
        connection = get_connection()
        cursor = connection.cursor(dictionary=True, buffered=True)
        cursor.execute("SELECT * FROM personal_info WHERE user_id=%s AND password=%s", (username, password))
        user = cursor.fetchone()
        user_info = db.query(PersonalInfo).filter(PersonalInfo.user_id == username).first()
        if user:
            return {"status": "success", "message": "Login successful"}
        else:
            return {"status": "error", "message": "Invalid credentials"}
    except Exception as e:
        return {"status": "error", "message": str(e)}
    finally:
        if cursor:
            cursor.close()
        if connection:
            connection.close()
   '''

@app.post("/login-check-student")
async def login_check_student(username=Body("user_id"), password=Body("password")):
    connection = None
    cursor = None
    try:
        connection = get_connection()
        cursor = connection.cursor(dictionary=True, buffered=True)
        cursor.execute("SELECT * FROM personal_info WHERE user_id=%s AND password=%s", (username, password))
        user = cursor.fetchone()
        if user:
            # Check if this user is actually a teacher (should not be allowed to login as student)
            school_id = user.get("school_id")
            if school_id:
                cursor.execute("SELECT teacher_id FROM teacher_data WHERE teacher_id=%s", (school_id,))
                teacher = cursor.fetchone()
                if teacher:
                    return {"status": "error", "message": "This is a teacher account. Please use teacher login."}
            
            # If not a teacher, allow student login
            # Remove password from response for security
            if 'password' in user:
                del user['password']
            return {"status": "success", "message": "Login successful", "user": user}
        else:
            return {"status": "error", "message": "Invalid credentials"}
    except Exception as e:
        return {"status": "error", "message": str(e)}
    finally:
        if cursor:
            cursor.close()
        if connection:
            connection.close()

@app.post("/sign-up")
async def sign_up(user_id=Body("user_id"), password=Body("password"),
                  given_name=Body("given_name"), surname=Body("surname"),
                  age=Body("age"), school_id=Body("school_id"), intended_major=Body("intended_major"),
                  email=Body("email"), classOf=Body("class")):
    # Validate input formats
    if not re.match(r"^[\w\s]{2,20}$", given_name) or not re.match(r"^[\w\s]{2,20}$", surname):
        return {"status": "error", "message": "Invalid name format"}
    if not re.match(r"^[\w\.-]+@[\w\.-]+\.\w+$", email):
        return {"status": "error", "message": "Invalid email format"}
    if not re.match(r"^\d{1,3}$", age):
        return {"status": "error", "message": "Invalid age format"}
    if not re.match(r"^\d{1,10}$", school_id):
        return {"status": "error", "message": "Invalid school ID format"}
    if not re.match(r"^[\w\s]{2,20}$", classOf):
        return {"status": "error", "message": "Invalid class format"}

    connection = None
    cursor = None
    try:
        connection = get_connection()
        cursor = connection.cursor(dictionary=True, buffered=True)
        cursor.execute("SELECT * FROM personal_info WHERE user_id=%s", (user_id,))
        user = cursor.fetchone()
        if not user:
            cursor.execute("INSERT INTO student_data (school_id, user_id, password, point, validated) VALUES (%s, %s, %s, %s, %s)", (school_id, user_id, password, "0", "1"))
            cursor.execute("INSERT INTO personal_info (user_id, password, given_name, surname, age, school_id, intended_major, email, class) VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s)",
                       (user_id, password, given_name, surname, age, school_id, intended_major, email, classOf))
            connection.commit()
            return {"status": "success", "message": "Account created successfully!"}
        else:
            return {"status": "error", "message": "Denied: Account already exists with this username."}
    except Exception as e:
        return {"status": "error", "message": str(e)}
    finally:
        if cursor:
            cursor.close()
        if connection:
            connection.close()
#== Registration END ===


#== Post START ===
@app.post("/post-upload")
async def post_upload(request: dict = Body(...)):
    time = request.get("upload_time")
    title = request.get("title")
    content = request.get("content")
    author_id = request.get("author_id")
    anonymous = request.get("anonymous")
    category = request.get("category")

    if not all([time, title, content, author_id, anonymous is not None, category]):
        return {"status": "error", "message": "Missing required fields"}

    # Convert ISO datetime to MySQL format
    try:
        from datetime import datetime
        # Parse ISO format and convert to MySQL datetime format
        dt = datetime.fromisoformat(time.replace('Z', '+00:00'))
        mysql_time = dt.strftime('%Y-%m-%d %H:%M:%S')
    except Exception as e:
        return {"status": "error", "message": f"Invalid datetime format: {str(e)}"}

    connection = None
    cursor = None
    try:
        connection = get_connection()
        cursor = connection.cursor(dictionary=True, buffered=True)
        cursor.execute("INSERT INTO post (upload_time, title, content, author_id, anonymous, category, validated) VALUES (%s, %s, %s, %s, %s, %s, %s)", (mysql_time, title, content, author_id, anonymous, category, 1))
        connection.commit()
        return {"status": "success", "message": "Post uploaded successfully!"}
    except Exception as e:
        return {"status": "error", "message": str(e)}
    finally:
        if cursor:
            cursor.close()
        if connection:
            connection.close()

'''
@app.get("/post-list")
async def post_list():
    connection = None
    cursor = None
    try:
        connection = get_connection()
        cursor = connection.cursor(dictionary=True, buffered=True)
        cursor.execute("SELECT * FROM post ORDER BY upload_time DESC")
        posts = cursor.fetchall()
        post_list = []
        for post in posts:
            post_list.append({
                "post_id": post["post_id"] if isinstance(post, dict) else post[0],
                "upload_time": post["upload_time"] if isinstance(post, dict) else post[1],
                "content": post["content"] if isinstance(post, dict) else post[2],
                "author_id": post["author_id"] if isinstance(post, dict) else post[3],
                "anonymous": post["anonymous"] if isinstance(post, dict) else post[4],
                "category": post["category"] if isinstance(post, dict) else post[5],
                "title": post["title"] if isinstance(post, dict) else post[6],
                "validated": post["validated"] if isinstance(post, dict) else post[7],
                "replies": []  # We'll need to fetch replies separately or join tables
            })
        return {"status": "success", "posts": post_list}
    except Exception as e:
        return {"status": "error", "message": str(e)}
    finally:
        if cursor:
            cursor.close()
        if connection:
            connection.close()
'''

@app.get("/post-list")
async def post_list(requester_school_id: str = Query(None), show_pending: bool = Query(False)):
    connection = None
    cursor = None
    try:
        connection = get_connection()
        cursor = connection.cursor(dictionary=True, buffered=True)
        # Determine privilege (teacher/admin) once
        if requester_school_id:
            is_teacher, is_admin = _is_privileged(cursor, requester_school_id)
        else:
            is_teacher, is_admin = False, False
        # Only admins can view unvalidated (pending) content via show_pending
        if is_admin:
            if show_pending:
                cursor.execute("SELECT * FROM post ORDER BY upload_time DESC")
            else:
                cursor.execute("SELECT * FROM post WHERE validated=1 ORDER BY upload_time DESC")
        else:
            cursor.execute("SELECT * FROM post WHERE validated=1 ORDER BY upload_time DESC")
        posts = cursor.fetchall()
        post_list = []
        for post in posts:
            # Fetch replies for this post
            cursor2 = connection.cursor(dictionary=True, buffered=True)
            cursor2.execute("SELECT * FROM reply WHERE parent_post_id = %s ORDER BY upload_time ASC", (post["post_id"],))
            replies = cursor2.fetchall()
            cursor2.close()
            # Author display logic
            if post["anonymous"]:
                # Only admins see anonymous author (teachers no longer privileged)
                display_author = post["author_id"] if is_admin else "Anonymous"
            else:
                display_author = post["author_id"]
            # Replies author display logic
            processed_replies = []
            for reply in replies:
                if reply["anonymous"]:
                    reply_author = reply["author_id"] if is_admin else "Anonymous"
                else:
                    reply_author = reply["author_id"]
                processed_replies.append({
                    "reply_id": reply["reply_id"],
                    "parent_post_id": reply["parent_post_id"],
                    "author_id": reply_author,
                    "upload_time": reply["upload_time"],
                    "anonymous": reply["anonymous"],
                    "content": reply["content"],
                    "validated": reply.get("validated", 1)
                })
            post_list.append({
                "post_id": post["post_id"],
                "upload_time": post["upload_time"],
                "content": post["content"],
                "author_id": display_author,
                "anonymous": post["anonymous"],
                "category": post["category"],
                "title": post["title"],
                "validated": post["validated"],
                "replies": processed_replies
            })
        return {"status": "success", "posts": post_list}
    except Exception as e:
        return {"status": "error", "message": str(e)}
    finally:
        if cursor:
            cursor.close()
        if connection:
            connection.close()


@app.get("/get-post-replies")
async def get_post_replies(post_id: int, requester_school_id: str = Query(None)):
    connection = None
    cursor = None
    try:
        connection = get_connection()
        cursor = connection.cursor(dictionary=True, buffered=True)
        # Check if requester is privileged (teacher/admin)
        if requester_school_id:
            is_teacher, is_admin = _is_privileged(cursor, requester_school_id)
        else:
            is_teacher, is_admin = False, False
        # Only admins are treated as privileged for anonymity now
        is_privileged = is_admin
        # First check if the post exists
        cursor.execute("SELECT post_id FROM post WHERE post_id=%s", (post_id,))
        post = cursor.fetchone()
        if not post:
            return {"status": "error", "message": "Post not found"}
        # Get all replies for this post from the reply table
        cursor.execute("SELECT * FROM reply WHERE parent_post_id=%s ORDER BY upload_time ASC", (post_id,))
        replies = cursor.fetchall()
        reply_list = []
        for reply in replies:
            if reply["anonymous"]:
                display_author = reply["author_id"] if is_privileged else "Anonymous"
            else:
                display_author = reply["author_id"]
            reply_list.append({
                "reply_id": reply["reply_id"],
                "parent_post_id": reply["parent_post_id"],
                "author_id": display_author,
                "upload_time": reply["upload_time"],
                "anonymous": reply["anonymous"],
                "content": reply["content"],
                "validated": reply.get("validated", 1)
            })
        return {"status": "success", "replies": reply_list}
    except Exception as e:
        return {"status": "error", "message": str(e)}
    finally:
        if cursor:
            cursor.close()
        if connection:
            connection.close()
@app.post("/my-post-list")
async def my_post_list(request: dict = Body(...)):
    author = request.get("author_id")
    if not author:
        return {"status": "error", "message": "author_id is required"}

    connection = None
    cursor = None
    try:
        connection = get_connection()
        cursor = connection.cursor(dictionary=True, buffered=True)
        cursor.execute("SELECT * FROM post WHERE author_id=%s ", (author,))
        my_posts = cursor.fetchall()
        my_post_list = []
        for post in my_posts:
            cursor2 = connection.cursor(dictionary=True, buffered=True)
            cursor2.execute("SELECT * FROM reply WHERE parent_post_id = %s ORDER BY upload_time ASC", (post["post_id"],))
            replies = cursor2.fetchall()
            cursor2.close()
            my_post_list.append({
                "post_id": post["post_id"],
                "upload_time": post["upload_time"],
                "content": post["content"],
                "author_id": post["author_id"],
                "anonymous": post["anonymous"],
                "category": post["category"],
                "title": post["title"],
                "validated": post["validated"],
                "replies": replies
            })
        return {"status": "success", "posts": my_post_list}
    except Exception as e:
        return {"status": "error", "message": str(e)}
    finally:
        if cursor:
            cursor.close()
        if connection:
            connection.close()

'''
@app.post("/my-post-list")
async def my_post_list(request: dict = Body(...)):
    author = request.get("author_id")
    if not author:
        return {"status": "error", "message": "author_id is required"}

    connection = None
    cursor = None
    try:
        connection = get_connection()
        cursor = connection.cursor(dictionary=True, buffered=True)
        cursor.execute("SELECT * FROM post WHERE author_id=%s ", (author,))
        my_posts = cursor.fetchall()
        my_post_list = []
        for post in my_posts:
            my_post_list.append({
                "post_id": post["post_id"] if isinstance(post, dict) else post[0],
                "upload_time": post["upload_time"] if isinstance(post, dict) else post[1],
                "content": post["content"] if isinstance(post, dict) else post[2],
                "author_id": post["author_id"] if isinstance(post, dict) else post[3],
                "anonymous": post["anonymous"] if isinstance(post, dict) else post[4],
                "category": post["category"] if isinstance(post, dict) else post[5],
                "title": post["title"] if isinstance(post, dict) else post[6],
                "validated": post["validated"] if isinstance(post, dict) else post[7],
                "replies": []  # We'll need to fetch replies separately if needed
            })
        return {"status": "success", "posts": my_post_list}
    except Exception as e:
        return {"status": "error", "message": str(e)}
    finally:
        if cursor:
            cursor.close()
        if connection:
            connection.close()
'''
'''
@app.get("/post-by-category")
async def post_by_category(category: str):
    connection = None
    cursor = None
    try:
        connection = get_connection()
        cursor = connection.cursor(dictionary=True, buffered=True)
        cursor.execute("SELECT * FROM post WHERE category=%s AND validated=1", (category,))
        posts = cursor.fetchall()
        post_list = []
        for post in posts:
            post_list.append({
                "post_id": post["post_id"] if isinstance(post, dict) else post[0],
                "upload_time": post["upload_time"] if isinstance(post, dict) else post[1],
                "content": post["content"] if isinstance(post, dict) else post[2],
                "title": post["title"] if isinstance(post, dict) else post[3],
                "author_id": post["author_id"] if isinstance(post, dict) else post[4],
                "anonymous": post["anonymous"] if isinstance(post, dict) else post[5],
                "validated": post["validated"] if isinstance(post, dict) else post[6],
                "category": post["category"] if isinstance(post, dict) else post[7],
                "replies": []  # We'll need to fetch replies separately or join tables
            })
        return {"status": "success", "posts": post_list}
    except Exception as e:
        return {"status": "error", "message": str(e)}
    finally:
        if cursor:
            cursor.close()
        if connection:
            connection.close()
'''

@app.get("/post-by-category")
async def post_by_category(category: str, requester_school_id: str = Query(None), show_pending: bool = Query(False)):
    connection = None
    cursor = None
    try:
        connection = get_connection()
        cursor = connection.cursor(dictionary=True, buffered=True)
        # Only admins can see unvalidated posts now
        if requester_school_id:
            _is_teacher, is_admin = _is_privileged(cursor, requester_school_id)
        else:
            _is_teacher, is_admin = False, False
        if is_admin:
            if show_pending:
                cursor.execute("SELECT * FROM post WHERE category=%s", (category,))
            else:
                cursor.execute("SELECT * FROM post WHERE category=%s AND validated=1", (category,))
        else:
            cursor.execute("SELECT * FROM post WHERE category=%s AND validated=1", (category,))
        posts = cursor.fetchall()
        post_list = []
        for post in posts:
            # Fetch replies for this post
            cursor2 = connection.cursor(dictionary=True, buffered=True)
            cursor2.execute("SELECT * FROM reply WHERE parent_post_id = %s ORDER BY upload_time ASC", (post["post_id"],))
            replies = cursor2.fetchall()
            cursor2.close()
            # Author display logic
            if post["anonymous"]:
                display_author = post["author_id"] if is_admin else "Anonymous"
            else:
                display_author = post["author_id"]
            # Replies author display logic
            processed_replies = []
            for reply in replies:
                if reply["anonymous"]:
                    reply_author = reply["author_id"] if is_admin else "Anonymous"
                else:
                    reply_author = reply["author_id"]
                processed_replies.append({
                    "reply_id": reply["reply_id"],
                    "parent_post_id": reply["parent_post_id"],
                    "author_id": reply_author,
                    "upload_time": reply["upload_time"],
                    "anonymous": reply["anonymous"],
                    "content": reply["content"]
                })
            post_list.append({
                "post_id": post["post_id"],
                "upload_time": post["upload_time"],
                "content": post["content"],
                "title": post["title"],
                "author_id": display_author,
                "anonymous": post["anonymous"],
                "validated": post["validated"],
                "category": post["category"],
                "replies": processed_replies
            })
        return {"status": "success", "posts": post_list}
    except Exception as e:
        return {"status": "error", "message": str(e)}
    finally:
        if cursor:
            cursor.close()
        if connection:
            connection.close()


@app.post("/post-reply")
async def post_reply(request: dict = Body(...)):
    time = request.get("upload_time")
    parent_post_id = request.get("parent_post_id")
    content = request.get("content")
    author = request.get("author_id")
    anonymous = request.get("anonymous")

    if not all([time, parent_post_id, content, author, anonymous is not None]):
        return {"status": "error", "message": "Missing required fields"}

    # Convert ISO datetime to MySQL format
    try:
        from datetime import datetime
        dt = datetime.fromisoformat(time.replace('Z', '+00:00'))
        mysql_time = dt.strftime('%Y-%m-%d %H:%M:%S')
    except Exception as e:
        return {"status": "error", "message": f"Invalid datetime format: {str(e)}"}

    connection = None
    cursor = None
    try:
        connection = get_connection()
        cursor = connection.cursor(dictionary=True, buffered=True)

        # First check if the parent post exists
        cursor.execute("SELECT post_id FROM post WHERE post_id=%s", (parent_post_id,))
        parent_post = cursor.fetchone()

        if not parent_post:
            return {"status": "error", "message": "Parent post not found"}

        # Insert the reply into the reply table
        cursor.execute("INSERT INTO reply (parent_post_id, author_id, upload_time, anonymous, content) VALUES (%s, %s, %s, %s, %s)",
                      (parent_post_id, author, mysql_time, anonymous, content))

        connection.commit()
        return {"status": "success", "message": "Reply posted successfully!"}
    except Exception as e:
        return {"status": "error", "message": str(e)}
    finally:
        if cursor:
            cursor.close()
        if connection:
            connection.close()

@app.get("/get-post")
async def get_post(post_id: int, requester_school_id: str = Query(None)):
    connection = None
    cursor = None
    try:
        connection = get_connection()
        cursor = connection.cursor(dictionary=True, buffered=True)
        # Get the post first
        cursor.execute("SELECT * FROM post WHERE post_id=%s", (post_id,))
        post = cursor.fetchone()
        if not post:
            return {"status": "error", "message": "Post not found"}
        # Determine privilege (teacher/admin) using helper
        if requester_school_id:
            _is_teacher, is_admin = _is_privileged(cursor, requester_school_id)
        else:
            _is_teacher, is_admin = False, False
        # Get the requester's user_id if they exist
        requester_user_id = None
        is_author = False
        if requester_school_id:
            cursor.execute("SELECT user_id FROM personal_info WHERE school_id=%s", (requester_school_id,))
            requester_info = cursor.fetchone()
            if requester_info:
                requester_user_id = requester_info["user_id"]
                is_author = requester_user_id == post["author_id"]
        # SIMPLIFIED ACCESS CONTROL:
        # Privileged users (teacher/admin) can see everything
        # Access rules:
        # Admins can see any post; authors can see their own; everyone else only validated
        if is_admin:
            pass
        elif is_author:
            pass
        elif post["validated"] == 1:
            pass
        else:
            return {"status": "error", "message": "Post not found"}
        # For privileged (teacher/admin), show real author even if anonymous
        if post["anonymous"]:
            display_author = post["author_id"] if is_admin else "Anonymous"
        else:
            display_author = post["author_id"]
        # Format the post data
        post_data = {
            "post_id": post["post_id"],
            "upload_time": post["upload_time"],
            "content": post["content"],
            "anonymous": post["anonymous"],
            "title": post["title"],
            "validated": post["validated"],
            "category": post["category"],
            "author_id": display_author,
        }
        return {"status": "success", "post": post_data, "is_admin": is_admin}
    except Exception as e:
        return {"status": "error", "message": str(e)}
    finally:
        if cursor:
            cursor.close()
        if connection:
            connection.close()

#== Teacher Exclusive START ===
@app.post("/login-check-teacher")
async def login_check_teacher(username=Body("user_id"), password=Body("password")):
    connection = None
    cursor = None
    try:
        connection = get_connection()
        cursor = connection.cursor(dictionary=True, buffered=True)
        # Step 1: Find user in personal_info
        cursor.execute("SELECT * FROM personal_info WHERE user_id=%s AND password=%s", (username, password))
        user = cursor.fetchone()
        if not user:
            return {"status": "error", "message": "Invalid credentials"}
        school_id = user.get("school_id")
        if not school_id:
            return {"status": "error", "message": "No school_id found for this user"}
        # Step 2: Check if school_id exists in teacher_data
        cursor.execute("SELECT * FROM teacher_data WHERE teacher_id=%s", (school_id,))
        teacher = cursor.fetchone()
        if teacher:
            # Remove password from response for security
            if 'password' in user:
                del user['password']
            user['is_teacher'] = True
            return {"status": "success", "message": "Login successful", "user": user}
        else:
            return {"status": "error", "message": "Not a teacher account"}
    except Exception as e:
        return {"status": "error", "message": str(e)}
    finally:
        if cursor:
            cursor.close()
        if connection:
            connection.close()

@app.get("/get-classes")
async def get_classes(school_id: str = Query(...)):
    connection = None
    cursor = None
    try:
        connection = get_connection()
        cursor = connection.cursor(dictionary=True, buffered=True)
        
        # First check if this school_id exists in teacher_data (verify it's a teacher)
        cursor.execute("SELECT teacher_id FROM teacher_data WHERE teacher_id=%s", (school_id,))
        teacher = cursor.fetchone()
        
        if not teacher:
            return {"status": "error", "message": "Access denied: Not a teacher account", "is_teacher": False}
        
        # If it's a valid teacher, get all classes where creator_id matches the school_id
        cursor.execute("SELECT * FROM classes WHERE creator_id=%s", (school_id,))
        classes = cursor.fetchall()
        
        class_list = []
        for class_item in classes:
            class_list.append({
                "class_id": class_item["class_id"],
                "creator_id": class_item["creator_id"], 
                "students": class_item["students"],
                "name": class_item["name"]
            })
        
        return {"status": "success", "classes": class_list, "is_teacher": True}
        
    except Exception as e:
        return {"status": "error", "message": str(e)}
    finally:
        if cursor:
            cursor.close()
        if connection:
            connection.close()

@app.get("/get-student-info")
async def get_student_info(school_id: str):
    connection = None
    cursor = None
    try:
        connection = get_connection()
        cursor = connection.cursor(dictionary=True, buffered=True)
        
        # Get student personal info from personal_info table
        cursor.execute("SELECT given_name, surname, user_id, school_id FROM personal_info WHERE school_id=%s", (school_id,))
        student = cursor.fetchone()
        
        if not student:
            return {"status": "error", "message": "Student not found"}
        
        return {"status": "success", "student": student}
        
    except Exception as e:
        return {"status": "error", "message": str(e)}
    finally:
        if cursor:
            cursor.close()
        if connection:
            connection.close()

@app.get("/get-student-post-count")
async def get_student_post_count(author_id: str):
    connection = None
    cursor = None
    try:
        connection = get_connection()
        cursor = connection.cursor(dictionary=True, buffered=True)
        
        # Count posts by this student
        cursor.execute("SELECT COUNT(*) as post_count FROM post WHERE author_id=%s", (author_id,))
        result = cursor.fetchone()
        
        post_count = result["post_count"] if result else 0
        
        return {"status": "success", "post_count": post_count}
        
    except Exception as e:
        return {"status": "error", "message": str(e)}
    finally:
        if cursor:
            cursor.close()
        if connection:
            connection.close()

@app.get("/search-students")
async def search_students(name: str):
    connection = None
    cursor = None
    try:
        connection = get_connection()
        cursor = connection.cursor(dictionary=True, buffered=True)
        
        query_term = name.strip()
        if not query_term:
            return {"status": "error", "message": "Please provide a name or student ID to search"}
        
        # Check if the query is a number (school_id search)
        if query_term.isdigit():
            # First check if this school_id exists in student_data (to verify it's a student)
            cursor.execute("SELECT school_id FROM student_data WHERE school_id=%s", (query_term,))
            student_exists = cursor.fetchone()
            
            if not student_exists:
                return {"status": "success", "students": []}
            
            # If student exists, get their info from personal_info
            cursor.execute("SELECT school_id, given_name, surname, email, class FROM personal_info WHERE school_id=%s", (query_term,))
            students = cursor.fetchall()
        else:
            # Search by name - split the name into parts for flexible searching
            name_parts = query_term.split()
            search_conditions = []
            params = []
            
            if len(name_parts) == 1:
                # Single name - search in both given_name and surname
                search_conditions.append("(given_name LIKE %s OR surname LIKE %s)")
                params.extend([f"%{name_parts[0]}%", f"%{name_parts[0]}%"])
            else:
                # Multiple parts - search various combinations
                first_name = name_parts[0]
                last_name = " ".join(name_parts[1:])
                search_conditions.append("(given_name LIKE %s AND surname LIKE %s)")
                params.extend([f"%{first_name}%", f"%{last_name}%"])
                
                # Also try reversed order
                search_conditions.append("(given_name LIKE %s AND surname LIKE %s)")
                params.extend([f"%{last_name}%", f"%{first_name}%"])
            
            # Only search for students (those who exist in student_data)
            query = f"""
            SELECT p.school_id, p.given_name, p.surname, p.email, p.class 
            FROM personal_info p 
            INNER JOIN student_data s ON p.school_id = s.school_id 
            WHERE {' OR '.join(search_conditions)}
            """
            cursor.execute(query, params)
            students = cursor.fetchall()
        
        return {"status": "success", "students": students}
        
    except Exception as e:
        return {"status": "error", "message": str(e)}
    finally:
        if cursor:
            cursor.close()
        if connection:
            connection.close()

@app.post("/add-student-to-class")
async def add_student_to_class(request: dict = Body(...)):
    class_id = request.get("class_id")
    school_id = request.get("school_id")
    
    if not class_id or not school_id:
        return {"status": "error", "message": "class_id and school_id are required"}
    
    connection = None
    cursor = None
    try:
        connection = get_connection()
        cursor = connection.cursor(dictionary=True, buffered=True)
        
        # Get current students list
        cursor.execute("SELECT students FROM classes WHERE class_id=%s", (class_id,))
        class_data = cursor.fetchone()
        
        if not class_data:
            return {"status": "error", "message": "Class not found"}
        
        current_students = class_data["students"] or ""
        student_ids = [id.strip() for id in current_students.split(",") if id.strip()]
        
        # Convert school_id to string to ensure consistency
        school_id_str = str(school_id)
        
        # Check if student is already in the class
        if school_id_str in student_ids:
            return {"status": "error", "message": "Student is already in this class"}
        
        # Add the new student
        student_ids.append(school_id_str)
        updated_students = ",".join(student_ids)
        
        # Update the class
        cursor.execute("UPDATE classes SET students=%s WHERE class_id=%s", (updated_students, class_id))
        connection.commit()
        
        return {"status": "success", "message": "Student added to class successfully"}
        
    except Exception as e:
        return {"status": "error", "message": str(e)}
    finally:
        if cursor:
            cursor.close()
        if connection:
            connection.close()

@app.post("/remove-student-from-class")
async def remove_student_from_class(request: dict = Body(...)):
    class_id = request.get("class_id")
    school_id = request.get("school_id")
    
    if not class_id or not school_id:
        return {"status": "error", "message": "class_id and school_id are required"}
    
    connection = None
    cursor = None
    try:
        connection = get_connection()
        cursor = connection.cursor(dictionary=True, buffered=True)
        
        # Get current students list
        cursor.execute("SELECT students FROM classes WHERE class_id=%s", (class_id,))
        class_data = cursor.fetchone()
        
        if not class_data:
            return {"status": "error", "message": "Class not found"}
        
        current_students = class_data["students"] or ""
        student_ids = [id.strip() for id in current_students.split(",") if id.strip()]
        
        # Convert school_id to string to ensure consistency
        school_id_str = str(school_id)
        
        # Check if student is in the class
        if school_id_str not in student_ids:
            return {"status": "error", "message": "Student is not in this class"}
        
        # Remove the student
        student_ids.remove(school_id_str)
        updated_students = ",".join(student_ids)
        
        # Update the class
        cursor.execute("UPDATE classes SET students=%s WHERE class_id=%s", (updated_students, class_id))
        connection.commit()
        
        return {"status": "success", "message": "Student removed from class successfully"}
        
    except Exception as e:
        return {"status": "error", "message": str(e)}
    finally:
        if cursor:
            cursor.close()
        if connection:
            connection.close()

@app.post("/create-class")
async def create_class(request: dict = Body(...)):
    creator_id = request.get("creator_id")
    name = request.get("name")
    
    if not creator_id or not name:
        return {"status": "error", "message": "creator_id and name are required"}
    
    connection = None
    cursor = None
    try:
        connection = get_connection()
        cursor = connection.cursor(dictionary=True, buffered=True)
        
        # Insert new class
        cursor.execute("INSERT INTO classes (creator_id, name, students) VALUES (%s, %s, %s)", 
                      (creator_id, name, ""))
        connection.commit()
        
        # Get the created class ID
        class_id = cursor.lastrowid
        
        return {"status": "success", "message": "Class created successfully", "class_id": class_id}
        
    except Exception as e:
        return {"status": "error", "message": str(e)}
    finally:
        if cursor:
            cursor.close()
        if connection:
            connection.close()

@app.post("/delete-class")
async def delete_class(request: dict = Body(...)):
    class_id = request.get("class_id")
    creator_id = request.get("creator_id")
    
    if not class_id or not creator_id:
        return {"status": "error", "message": "class_id and creator_id are required"}
    
    connection = None
    cursor = None
    try:
        connection = get_connection()
        cursor = connection.cursor(dictionary=True, buffered=True)
        
        # Verify the teacher owns this class
        cursor.execute("SELECT class_id FROM classes WHERE class_id=%s AND creator_id=%s", (class_id, creator_id))
        class_data = cursor.fetchone()
        
        if not class_data:
            return {"status": "error", "message": "Class not found or you don't have permission to delete it"}
        
        # Delete the class
        cursor.execute("DELETE FROM classes WHERE class_id=%s", (class_id,))
        connection.commit()
        
        return {"status": "success", "message": "Class deleted successfully"}
        
    except Exception as e:
        return {"status": "error", "message": str(e)}
    finally:
        if cursor:
            cursor.close()
        if connection:
            connection.close()

@app.post("/rename-class")
async def rename_class(request: dict = Body(...)):
    class_id = request.get("class_id")
    creator_id = request.get("creator_id")
    new_name = request.get("new_name")
    
    if not class_id or not creator_id or not new_name:
        return {"status": "error", "message": "class_id, creator_id, and new_name are required"}
    
    connection = None
    cursor = None
    try:
        connection = get_connection()
        cursor = connection.cursor(dictionary=True, buffered=True)
        
        # Verify the teacher owns this class
        cursor.execute("SELECT class_id FROM classes WHERE class_id=%s AND creator_id=%s", (class_id, creator_id))
        class_data = cursor.fetchone()
        
        if not class_data:
            return {"status": "error", "message": "Class not found or you don't have permission to rename it"}
        
        # Update the class name
        cursor.execute("UPDATE classes SET name=%s WHERE class_id=%s", (new_name.strip(), class_id))
        connection.commit()
        
        return {"status": "success", "message": "Class renamed successfully"}
        
    except Exception as e:
        return {"status": "error", "message": str(e)}
    finally:
        if cursor:
            cursor.close()
        if connection:
            connection.close()

@app.post("/block-post")
async def block_post(request: dict = Body(...)):
    post_id = request.get("post_id")
    requester_school_id = request.get("requester_school_id")
    
    if not post_id or not requester_school_id:
        return {"status": "error", "message": "post_id and requester_school_id are required"}
    
    connection = None
    cursor = None
    try:
        connection = get_connection()
        cursor = connection.cursor(dictionary=True, buffered=True)
        
        # Verify the requester is a teacher or admin
        cursor.execute("SELECT teacher_id FROM teacher_data WHERE teacher_id=%s", (requester_school_id,))
        teacher = cursor.fetchone()
        cursor.execute("SELECT admin_id FROM admin_data WHERE admin_id=%s", (requester_school_id,))
        admin = cursor.fetchone()
        if not teacher and not admin:
            return {"status": "error", "message": "Access denied: Only teachers or admins can block posts"}
        
        # Check if the post exists
        cursor.execute("SELECT post_id, validated FROM post WHERE post_id=%s", (post_id,))
        post = cursor.fetchone()
        
        if not post:
            return {"status": "error", "message": "Post not found"}
        
        # Update the post validation status to 0 (blocked)
        cursor.execute("UPDATE post SET validated=0 WHERE post_id=%s", (post_id,))
        connection.commit()
        
        return {"status": "success", "message": "Post blocked successfully"}
        
    except Exception as e:
        return {"status": "error", "message": str(e)}
    finally:
        if cursor:
            cursor.close()
        if connection:
            connection.close()

@app.post("/validate-post")
async def validate_post(request: dict = Body(...)):
    post_id = request.get("post_id")
    requester_school_id = request.get("requester_school_id")
    
    if not post_id or not requester_school_id:
        return {"status": "error", "message": "post_id and requester_school_id are required"}
    
    connection = None
    cursor = None
    try:
        connection = get_connection()
        cursor = connection.cursor(dictionary=True, buffered=True)
        
        # Verify the requester is a teacher or admin
        cursor.execute("SELECT teacher_id FROM teacher_data WHERE teacher_id=%s", (requester_school_id,))
        teacher = cursor.fetchone()
        cursor.execute("SELECT admin_id FROM admin_data WHERE admin_id=%s", (requester_school_id,))
        admin = cursor.fetchone()
        if not teacher and not admin:
            return {"status": "error", "message": "Access denied: Only teachers or admins can validate posts"}
        
        # Check if the post exists
        cursor.execute("SELECT post_id, validated FROM post WHERE post_id=%s", (post_id,))
        post = cursor.fetchone()
        
        if not post:
            return {"status": "error", "message": "Post not found"}
        
        # Update the post validation status to 1 (validated)
        cursor.execute("UPDATE post SET validated=1 WHERE post_id=%s", (post_id,))
        connection.commit()
        
        return {"status": "success", "message": "Post validated successfully"}
        
    except Exception as e:
        return {"status": "error", "message": str(e)}
    finally:
        if cursor:
            cursor.close()
        if connection:
            connection.close()
#== Teacher Exclusive END ===

#=== Admin & Extended Moderation START ===
@app.post("/login-check-admin")
async def login_check_admin(username=Body("user_id"), password=Body("password")):
    """Authenticate an admin (must exist in personal_info + admin_data)."""
    connection = None
    cursor = None
    try:
        connection = get_connection()
        cursor = connection.cursor(dictionary=True, buffered=True)
        cursor.execute("SELECT * FROM personal_info WHERE user_id=%s AND password=%s", (username, password))
        user = cursor.fetchone()
        if not user:
            return {"status": "error", "message": "Invalid credentials"}
        school_id = user.get("school_id")
        if not school_id:
            return {"status": "error", "message": "No school_id found for this user"}
        cursor.execute("SELECT admin_id FROM admin_data WHERE admin_id=%s", (school_id,))
        admin = cursor.fetchone()
        if not admin:
            return {"status": "error", "message": "Not an admin account"}
        if 'password' in user:
            del user['password']
        user['is_admin'] = True
        return {"status": "success", "message": "Login successful", "user": user}
    except Exception as e:
        return {"status": "error", "message": str(e)}
    finally:
        if cursor:
            cursor.close()
        if connection:
            connection.close()

def _is_privileged(cursor, school_id):
    """Return (is_teacher, is_admin) for either a school_id OR user_id.
    If the identifier is a user_id, resolve its school_id first via personal_info.
    """
    if not school_id:
        return False, False
    # First try direct match as school_id
    cursor.execute("SELECT school_id FROM personal_info WHERE school_id=%s", (school_id,))
    row = cursor.fetchone()
    resolved = school_id
    if not row:
        # Try treat as user_id
        cursor.execute("SELECT school_id FROM personal_info WHERE user_id=%s", (school_id,))
        row2 = cursor.fetchone()
        if row2:
            resolved = row2['school_id']
    # Now privilege lookups with resolved school id
    cursor.execute("SELECT teacher_id FROM teacher_data WHERE teacher_id=%s", (resolved,))
    teacher = cursor.fetchone()
    cursor.execute("SELECT admin_id FROM admin_data WHERE admin_id=%s", (resolved,))
    admin = cursor.fetchone()
    return bool(teacher), bool(admin)


@app.post("/block-reply")
async def block_reply(request: dict = Body(...)):
    reply_id = request.get("reply_id")
    requester_school_id = request.get("requester_school_id")
    if not reply_id or not requester_school_id:
        return {"status": "error", "message": "reply_id and requester_school_id are required"}
    connection = None
    cursor = None
    try:
        connection = get_connection()
        cursor = connection.cursor(dictionary=True, buffered=True)
        is_teacher, is_admin = _is_privileged(cursor, requester_school_id)
        if not (is_teacher or is_admin):
            return {"status": "error", "message": "Access denied"}
        cursor.execute("SELECT reply_id FROM reply WHERE reply_id=%s", (reply_id,))
        reply = cursor.fetchone()
        if not reply:
            return {"status": "error", "message": "Reply not found"}
        cursor.execute("UPDATE reply SET validated=0 WHERE reply_id=%s", (reply_id,))
        connection.commit()
        return {"status": "success", "message": "Reply blocked successfully"}
    except Exception as e:
        return {"status": "error", "message": str(e)}
    finally:
        if cursor:
            cursor.close()
        if connection:
            connection.close()

@app.post("/validate-reply")
async def validate_reply(request: dict = Body(...)):
    reply_id = request.get("reply_id")
    requester_school_id = request.get("requester_school_id")
    if not reply_id or not requester_school_id:
        return {"status": "error", "message": "reply_id and requester_school_id are required"}
    connection = None
    cursor = None
    try:
        connection = get_connection()
        cursor = connection.cursor(dictionary=True, buffered=True)
        is_teacher, is_admin = _is_privileged(cursor, requester_school_id)
        if not (is_teacher or is_admin):
            return {"status": "error", "message": "Access denied"}
        cursor.execute("SELECT reply_id FROM reply WHERE reply_id=%s", (reply_id,))
        reply = cursor.fetchone()
        if not reply:
            return {"status": "error", "message": "Reply not found"}
        cursor.execute("UPDATE reply SET validated=1 WHERE reply_id=%s", (reply_id,))
        connection.commit()
        return {"status": "success", "message": "Reply validated successfully"}
    except Exception as e:
        return {"status": "error", "message": str(e)}
    finally:
        if cursor:
            cursor.close()
        if connection:
            connection.close()

@app.get("/pending-content")
async def pending_content(requester_school_id: str = Query(...)):
    connection = None
    cursor = None
    try:
        connection = get_connection()
        cursor = connection.cursor(dictionary=True, buffered=True)
        is_teacher, is_admin = _is_privileged(cursor, requester_school_id)
        if not (is_teacher or is_admin):
            return {"status": "error", "message": "Access denied"}
        cursor.execute("SELECT * FROM post WHERE validated=0 ORDER BY upload_time DESC")
        posts = cursor.fetchall()
        cursor.execute("SELECT * FROM reply WHERE validated=0 ORDER BY upload_time DESC")
        replies = cursor.fetchall()
        return {"status": "success", "posts": posts, "replies": replies}
    except Exception as e:
        return {"status": "error", "message": str(e)}
    finally:
        if cursor:
            cursor.close()
        if connection:
            connection.close()

#=== Admin & Extended Moderation END ===

