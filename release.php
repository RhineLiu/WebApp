<!DOCTYPE html>
<html>
<head>
	<meta http-equiv="Content-Type" content="text/html; charset=utf-8"/>
	<meta name="viewport" content="width=device-width,height=device-height; initial-scale=1.0; maximum-scale=1.0; user-scalable=no;"/>
	<title>WebApp Release</title>
</head>
<body>

<?php

echo "creating dirs...<br/><br/>";
// 创建目录
check_dirs(array(
	"release/",
	"release/resource/",
	"release/resource/css/",
	"release/resource/js/",
	"release/resource/htmls/",
	"release/resource/images/",
	"release/resource/jsons/"
));
function check_dirs($dirs)
{
	foreach ($dirs as $dir) {
		if (!is_dir($dir)) mkdir($dir);
	}
}

echo "copying resources...<br/><br/>";
recurse_copy("resource/htmls/", "release/resource/htmls/");
recurse_copy("resource/images/", "release/resource/images/");
recurse_copy("resource/jsons/", "release/resource/jsons/");
recurse_copy("resource/fonts/", "release/resource/fonts/");
/**
 * 复制资源
 * @param {string} $src 原目录
 * @param {string} $dst 复制到的目录
 */
function recurse_copy($src, $dst)
{  // 原目录，复制到的目录
	$dir = opendir($src);
	@mkdir($dst);
	while (false !== ($file = readdir($dir))) {
		if (($file != '.') && ($file != '..')) {
			if (is_dir($src . '/' . $file)) {
				recurse_copy($src . '/' . $file, $dst . '/' . $file);
			} else {
				copy($src . '/' . $file, $dst . '/' . $file);
			}
		}
	}
	closedir($dir);
}


$res_json = "resource/resource.txt";
$script_file = "release/resource/js/app.min.js";
$style_file = "release/resource/css/app.min.css";
$index_file = "release/index.html";

$res = json_decode(file_get_contents($res_json), true);
//echo "resource:";
//var_dump($res);

$style = "";
echo "getting app styles contents...<br/>";
$app_styles = $res["app"]["styles"];
echo "merging app styles contents...<br/>";
foreach ($app_styles as $url) {
	$style .= file_get_contents("resource/" . $url) . "\n";
}
echo "putting app styles contents...<br/>";
file_put_contents($style_file, $style);
echo $style_file . " write over!<br/><br/>";

$script = "";
echo "getting libScripts contents...<br/>";
$lib_scripts = $res["libScripts"];
echo "merging libScripts contents...<br/>";
foreach ($lib_scripts as $url) {
	$script .= file_get_contents("libs/" . $url) . "\n";
}
echo "getting app scripts contents...<br/>";
$app_scripts = $res["app"]["scripts"];
echo "merging app scripts contents...<br/>";
foreach ($app_scripts as $url) {
	$script .= file_get_contents("resource/" . $url) . "\n";
}
// 只保留app里的images和htmls
$res = array(
	"app" => array(
		"images" => $res["app"]["images"],
		"htmls" => $res["app"]["htmls"]
	)
);
$script .= "var Resources = " . json_encode($res) . ";\n";
echo "putting scripts contents...<br/>";
file_put_contents($script_file, $script);
echo $script_file . " write over!<br/><br/>";

echo "getting index.html...<br/>";
$htmDoc = new DOMDocument;
$htmDoc->loadHTMLFile("index.html");
$htmDoc->normalizeDocument();
removeCSS($htmDoc);
removeJS($htmDoc);
insertCSS($htmDoc, "resource/css/app.min.css");
insertJS($htmDoc, "resource/js/app.min.js");
echo "putting index.html...<br/>";
file_put_contents($index_file, $htmDoc->saveHTML());
echo $index_file . " write over!<br/><br/>";

function removeCSS($htmDoc)
{
	$head = $htmDoc->getElementsByTagName('head');
	$links = $head->item(0)->getElementsByTagName('link');
	for ($i=$links->length-1; $i>=0; --$i) {
		$link = $links->item($i);
		if ($link->hasAttribute("src"))
			$head->item(0)->removeChild($link);
	}
}
function removeJS($htmDoc)
{
	$body = $htmDoc->getElementsByTagName('body');
	$scripts = $body->item(0)->getElementsByTagName('script');
	for ($i=$scripts->length-1; $i>=0; --$i) {
		$script = $scripts->item($i);
		if ($script->hasAttribute("src"))
			$body->item(0)->removeChild($script);
	}
}
function insertCSS($htmDoc, $src)
{
	$head = $htmDoc->getElementsByTagName('head');
	$link = $htmDoc->createElement("link");
	$link->setAttribute("rel", "stylesheet");
	$link->setAttribute("href", $src);
	$head->item(0)->appendChild($link);
}

function insertJS($htmDoc, $src)
{
	$body = $htmDoc->getElementsByTagName('body');
	$script = $htmDoc->createElement("script");
	$script->setAttribute("src", $src);
	$body->item(0)->appendChild($script);
}

// 结束后提示
echo "\n<script>alert('请格式化".$index_file."\\n并压缩".$script_file."！')</script>";

?>

</body>
</html>