<?php
namespace App\Globals;



class Visitor
{
	private static $file = "visitor_counter.txt";

	public static function use_the_counter()
	{
		$counter = 0;
		$handle  = @fopen(self::$file, "c+");
		if($handle)
		{
			$counter = (int ) fread($handle,20000);
			$counter++;
			rewind($handle);
			ftruncate($handle, 0);
			fwrite($handle, $counter);
			fclose($handle);
		}
	}

	public static function get_all_visitors()
	{
		$counter = 0;
		$handle = @fopen(self::$file, "c+");
		if($handle)
		{
			$counter = (int ) fread($handle,20000);
			fclose($handle);
		}

		$return['all'] 	= $counter;
		$return['week'] = round($counter*0.2);
		return $return;
	}
}