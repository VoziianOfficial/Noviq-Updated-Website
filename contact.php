<?php
declare(strict_types=1);
header('Content-Type: application/json; charset=utf-8');
header('Cache-Control: no-store');
function respond(int $code, bool $success, string $message): never {
 http_response_code($code);
 echo json_encode(['success'=>$success,'message'=>$message]);
 exit;
}
if ($_SERVER['REQUEST_METHOD'] !== 'POST') respond(405,false,'Method not allowed.');
if ((int)($_SERVER['CONTENT_LENGTH'] ?? 0)>20000) respond(413,false,'Request is too large.');
$raw=file_get_contents(__DIR__.'/config/config.js');
$config=json_decode(trim(preg_replace('/^window\.SITE_CONFIG\s*=\s*/','',$raw),"; \n\r\t"),true);
if (!$config || empty($config['form']['enabled'])) respond(503,false,'The enquiry service is not connected yet.');
$recipient=$config['email'] ?? '';
if (!filter_var($recipient,FILTER_VALIDATE_EMAIL) || str_ends_with($recipient,'.example')) respond(503,false,'The enquiry service is not configured.');
foreach (['name','email','company','service','message','website','consent'] as $key) if(isset($_POST[$key])&&!is_string($_POST[$key])) respond(422,false,'Invalid request.');
$name=trim($_POST['name']??'');$email=trim($_POST['email']??'');$company=trim($_POST['company']??'');$service=trim($_POST['service']??'');$message=trim($_POST['message']??'');
if (!empty($_POST['website'])) respond(422,false,'Invalid request.');
if ($name===''||strlen($name)>100||!filter_var($email,FILTER_VALIDATE_EMAIL)||strlen($email)>254||preg_match('/[\r\n]/',$email)||strlen($company)>150||strlen($message)<10||strlen($message)>5000||empty($_POST['consent'])) respond(422,false,'Please check your details and privacy consent.');
$allowed=['Google Ads','SEO & Local Search','Google Shopping','YouTube Advertising','Analytics & Meta','Advertising & collaboration'];
if (!in_array($service,$allowed,true)) respond(422,false,'Please choose a valid service.');
$origin=$_SERVER['HTTP_ORIGIN']??'';
if($origin && parse_url($origin,PHP_URL_HOST)!==explode(':',$_SERVER['HTTP_HOST']??'')[0])respond(403,false,'Request origin is not allowed.');
$key=hash('sha256',($_SERVER['REMOTE_ADDR']??'unknown').__DIR__);
$lock=fopen(sys_get_temp_dir().'/noviq-'.$key.'.lock','c+');
if(!$lock||!flock($lock,LOCK_EX))respond(503,false,'Please try again later.');
$last=(int)stream_get_contents($lock);
if(time()-$last<60)respond(429,false,'Please wait a minute before sending another request.');
ftruncate($lock,0);rewind($lock);fwrite($lock,(string)time());flock($lock,LOCK_UN);fclose($lock);
$subject='New website enquiry: '.$service;
$body="Name: $name\nEmail: $email\nCompany: $company\nService: $service\n\n$message\n\nPrivacy consent: confirmed";
$headers=['From'=>$recipient,'Reply-To'=>$email,'Content-Type'=>'text/plain; charset=UTF-8'];
if(!mail($recipient,$subject,$body,$headers))respond(502,false,'The mail server could not accept your request. Please try again later.');
respond(200,true,$config['form']['successMessage']);
