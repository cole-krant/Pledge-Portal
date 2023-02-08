INSERT INTO users(
    user_id,
    username,
    password,
    name,
    admin,

    class,
    major,
    committee,

    bio,

    school_email,
    personal_email,
    professional_email,
    linkedin,
    phone,

    brother,
    pledge,

    points,

    hobby1,
    hobby2,
    hobby3,
    h1_caption,
    h2_caption,
    h3_caption,

    career_position,
    career_organization,
    experience,
    aspirations,

    likes,
    dislikes,
    quote
)
VALUES(
    50,
    'Cole Krant',
    '$2a$08$ab8OIBS4PX1/ZkB8y0jcter8Awit4H6QAK7pesO4Zw64am7jZhPwa',
    'Cole Krant',
    'true',

    'Sophomore',
    'Computer Science',
    'Pledge Team',

    'I love spending time with friends and working on projects. I enjoy hiking and snowboarding, and love Philosophy',

    'cokr5885@colorado.edu',
    'ckrant4@gmail.com',
    'cole.krant@gmail.com',
    'https://www.linkedin.com/in/cole-krant/',
    '(512) 636-2466',

    'true',
    'false',

    0,

    'Hiking',
    'Snowboarding',
    'Traveling',
    'As officer of the hiking club, I enjoy leading trips every weekend I can',
    'Speaking as a dude from Texas, god damn I love the slopes',
    'Rome! Visting with my family over the summer',

    'Vice President of Membership',
    'Alpha Kappa Psi',
    'This role has enhanced my ability to work and manage teams. I also learned a lot about software development through this website I created.',
    'I aspire to master computer science such that I may use my talent for good',

    'Hiking, Mountain Biking, Snowboarding, Coffee, Learning and Philosphy',
    'Rubber ducks, push/pull doors, apple cider',
    'The road goes on forever, and the party never ends!');


INSERT INTO users(
    user_id, 
    username, password, name, admin, class, major, committee, net_group,
    preliminary_forms, big_brother_mentor, getting_to_know_you, informational_interviews, 
    resume, domingos, brother_interviews, points, pfp_img)
VALUES(
    60, 
    'Katie McDonald', 
    '$2a$08$ydefqM3IDKnVXX.l6/YWgOHpc4Cm4pU8.MjLLTh89/iTObK8ANohK', 
    'Katie McDonald',
    'true',
    'Sophomore', 
    'Business',
    
    'Bridge Education Committee', 'Pledge Team', 'true', 'true', 'true', 'true', NULL, 0, 0, 0, '');

-- Password --> pledgeteam1234

INSERT INTO users(
    user_id, 
    username, password, name, admin, class, major, committee, net_group,
    preliminary_forms, big_brother_mentor, getting_to_know_you, informational_interviews, 
    resume, domingos, brother_interviews, points, pfp_img)
VALUES(
    70, 
    'Emma Kochenderfer', 
    '$2a$08$ydefqM3IDKnVXX.l6/YWgOHpc4Cm4pU8.MjLLTh89/iTObK8ANohK', 
    'Emma Kochenderfer',
    'false', 
    'Senior', 
    'Business?',

    'Bridge Education Committee', 'Pledge Team', 'true', 'true', 'true', 'true', NULL, 0, 0, 0, '');


INSERT INTO users(
    user_id, 
    username, password, name, admin, class, major, committee, net_group,
    preliminary_forms, big_brother_mentor, getting_to_know_you, informational_interviews, 
    resume, domingos, brother_interviews, points, pfp_img)
VALUES(
    80, 
    'Nathan Brown', 
    '$2a$08$ydefqM3IDKnVXX.l6/YWgOHpc4Cm4pU8.MjLLTh89/iTObK8ANohK', 
    'Nathan Brown',
    'false',
    'Freshman', 
    'Business?',

    'Bridge Education Committee', 'Pledge Team', 'true', 'true', 'true', 'true', NULL, 0, 0, 0, '');


INSERT INTO users(
    user_id, 
    username, password, name, admin, class, major, committee, net_group,
    preliminary_forms, big_brother_mentor, getting_to_know_you, informational_interviews, 
    resume, domingos, brother_interviews, points, pfp_img)
VALUES(
    90, 
    'Harrison Klein', 
    '$2a$08$ydefqM3IDKnVXX.l6/YWgOHpc4Cm4pU8.MjLLTh89/iTObK8ANohK', 
    'Harrison Klein',
    'false', 
    'Freshman', 
    'Business?',

    'Bridge Education Committee', 'Pledge Team', 'true', 'true', 'true', 'true', NULL, 0, 0, 0, '');